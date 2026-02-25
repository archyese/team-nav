import axios from 'axios'
import { Message } from 'element-ui'
import QS from 'qs'
import Vue from 'vue'
import login, { isRelogin } from '@/components/login-dialog'
import offlineCache from '@/utils/offline-cache'

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: process.env.VUE_APP_BASE_API,
  // 超时
  timeout: 60000
})

// 需要缓存的API路径
const CACHEABLE_APIS = [
  '/api/v1/card/tree',
  '/api/v1/category/tree',
  '/api/v1/notice/list',
  '/api/v1/setting/list'
]

function isCacheable(url) {
  return CACHEABLE_APIS.some(api => url.includes(api))
}

// request拦截器
service.interceptors.request.use(config => {
  config.headers['X-Requested-With'] = 'XMLHttpRequest'
  config.paramsSerializer = param => QS.stringify(param, { indices: false })

  // 离线模式：检查缓存
  if (!navigator.onLine && config.method === 'get' && isCacheable(config.url)) {
    const cachedData = offlineCache.getCache(config.url)
    if (cachedData) {
      config.adapter = () => Promise.resolve(cachedData)
    }
  }
  return config
}, error => {
  console.log(error)
  Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(res => {
  if (res.request.responseType === 'blob') {
    return res
  }
  // 缓存 GET 响应数据
  if (res.config.method === 'get' && isCacheable(res.config.url)) {
    offlineCache.setCache(res.config.url, res.data)
  }
  return res.data
},
err => {
  const { message } = err
  if (message === 'Network Error') {
    // 离线模式：尝试使用缓存
    if (!navigator.onLine && err.config && err.config.method === 'get' && isCacheable(err.config.url)) {
      const cachedData = offlineCache.getCache(err.config.url)
      if (cachedData) {
        console.warn('使用离线缓存数据:', err.config.url)
        return Promise.resolve(cachedData)
      }
    }
    Message.error('后端接口连接异常')
    return Promise.reject(err)
  }
  if (message.includes('timeout')) {
    Message.error('系统接口请求超时')
    return Promise.reject(err)
  }
  if (err.response && err.response.status === 401) {
    if (!isRelogin.show) {
      isRelogin.show = true
      const constructor = Vue.extend(login)
      const instance = new constructor()
      instance.$mount()
    }
    return Promise.reject(err)
  }
  if (err.response && err.response.status === 403) {
    location.href = '/'
    return Promise.reject(err)
  }
  if (err.response.data instanceof String) {
    Message.error(err.response.data)
  }
  return Promise.reject(err)
}
)
service.save = (url, data, config) => data.id
  ? service.patch(`${url}/${data.id}`, data, config) : service.post(url, data, config)

export default service
