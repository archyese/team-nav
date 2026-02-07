# 打包前端
FROM node:16-alpine AS builder-frontend
# 工作目录
WORKDIR /app
# Step 1: 复制 package.json 和 yarn.lock，利用缓存安装依赖
COPY web/package.json ./
# Step 2: 设置镜像源
# RUN yarn config set registry https://registry.npmmirror.com && yarn install --check-cache
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --engine-strict=false --no-audit
# Step 3: 复制源代码（只有 src 改变时才触发后续步骤）
COPY web/. .
# Step 4: 构建应用
# RUN yarn build
RUN npm run build

# 打包后端
FROM archyese/openjdk:8u332-slim-buster-maven AS builder-backend
WORKDIR /app
COPY pom.xml ./
RUN mvn dependency:go-offline -B
COPY . .
RUN mvn clean compile -DskipTests
COPY --from=builder-frontend   /app/dist/ target/classes/static/
RUN mvn install -T 4C -q -DskipTests

# 构建镜像
FROM openjdk:8u201-alpine AS runner
#维护者
LABEL maintainer="tuituidan@163.com"
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone
# 拷贝程序
COPY --from=builder-backend   /app/target/team-nav.jar app.jar
# 暴露端口
EXPOSE 8080
# 存储卷
VOLUME ["/logs","/database","/ext-resources"]
# 设置环境变量
ENV PARAMS=""
#镜像入口
ENTRYPOINT ["sh", "-c", "java $PARAMS -jar app.jar"]