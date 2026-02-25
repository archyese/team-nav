<template>
  <el-drawer size="320px" :visible="visible" :with-header="false" :append-to-body="true" :show-close="false">
    <div class="drawer-container">
      <div>
        <div class="setting-drawer-content">
          <div class="setting-drawer-title">
            <h3 class="drawer-title">主题风格设置</h3>
          </div>
          <div class="setting-drawer-block-checbox">
            <div class="setting-drawer-block-checbox-item" @click="handleTheme('theme-dark')">
              <img src="@/assets/images/dark.svg" alt="dark">
              <div v-if="sideTheme === 'theme-dark'" class="setting-drawer-block-checbox-selectIcon"
                   style="display: block;">
                <i aria-label="图标: check" class="anticon anticon-check">
                  <svg viewBox="64 64 896 896" data-icon="check" width="1em" height="1em" :fill="theme"
                       aria-hidden="true" focusable="false" class="">
                    <path
                      d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"/>
                  </svg>
                </i>
              </div>
            </div>
            <div class="setting-drawer-block-checbox-item" @click="handleTheme('theme-light')">
              <img src="@/assets/images/light.svg" alt="light">
              <div v-if="sideTheme === 'theme-light'" class="setting-drawer-block-checbox-selectIcon"
                   style="display: block;">
                <i aria-label="图标: check" class="anticon anticon-check">
                  <svg viewBox="64 64 896 896" data-icon="check" width="1em" height="1em" :fill="theme"
                       aria-hidden="true" focusable="false" class="">
                    <path
                      d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"/>
                  </svg>
                </i>
              </div>
            </div>
          </div>
        </div>
        <el-divider/>
        <h3 class="drawer-title">系统布局配置</h3>

        <div class="drawer-item">
          <span>菜单设置</span>
          <el-checkbox-group v-model="menuSetting">
            <el-checkbox label="open">默认展开</el-checkbox>
            <el-checkbox label="accordion">手风琴</el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="drawer-item">
          <span>卡片图标</span>
          <el-radio-group v-model="cardIconShape">
            <el-radio label="circle">圆形</el-radio>
            <el-radio label="square">方形</el-radio>
          </el-radio-group>
        </div>
        <div class="drawer-item">
          <span>卡片大小</span>
          <el-radio-group v-model="cardSize">
            <el-radio label="small">较小</el-radio>
            <el-radio label="large">较大</el-radio>
          </el-radio-group>
        </div>
        <el-button size="small" type="primary" plain icon="el-icon-document-add" @click="saveSetting">保存配置</el-button>
        <el-button size="small" plain icon="el-icon-refresh" @click="resetSetting">重置配置</el-button>
        <el-divider/>
        <h3 class="drawer-title">离线缓存设置</h3>
        <div class="drawer-item">
          <span>启用离线缓存</span>
          <el-switch v-model="offlineEnabled" @change="handleOfflineChange"/>
        </div>
        <div v-if="offlineEnabled" class="offline-info">
          <div class="drawer-item">
            <span>缓存条目</span>
            <span>{{ cacheInfo.keys }} 个</span>
          </div>
          <div class="drawer-item">
            <span>缓存大小</span>
            <span>{{ cacheInfo.size }}</span>
          </div>
          <div class="drawer-item">
            <span>最后同步</span>
            <span>{{ cacheInfo.lastSync || '从未同步' }}</span>
          </div>
          <div class="offline-buttons">
            <el-button size="small" type="primary" plain icon="el-icon-refresh" @click="syncData">立即同步</el-button>
            <el-button size="small" plain icon="el-icon-delete" @click="clearCache">清除缓存</el-button>
          </div>
        </div>
        <el-divider/>
        <h3 class="drawer-title">ServiceWorker 缓存</h3>
        <div class="drawer-item">
          <span>启用缓存</span>
          <el-switch v-model="swCacheEnabled" @change="handleSwCacheChange"/>
        </div>
        <div class="offline-info">
          <div class="drawer-item">
            <span>缓存条目</span>
            <span>{{ swCacheInfo.keys }} 个</span>
          </div>
          <div class="drawer-item">
            <span>缓存大小</span>
            <span>{{ swCacheInfo.size }}</span>
          </div>
          <div class="offline-buttons">
            <el-button size="small" type="primary" plain icon="el-icon-refresh" @click="updateSwCache">更新缓存</el-button>
            <el-button size="small" plain icon="el-icon-delete" @click="clearSwCache">清除缓存</el-button>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script>

export default {
  data() {
    return {
      theme: '#409EFF',
      sideTheme: this.$store.state.settings.sideTheme,
      offlineEnabled: this.$offlineCache.isEnabled(),
      cacheInfo: this.$offlineCache.getCacheInfo(),
      swCacheEnabled: true,
      swCacheInfo: {
        keys: 0,
        size: '0 B'
      }
    };
  },
  computed: {
    visible: {
      get() {
        return this.$store.state.settings.showSettings
      }
    },
    menuSetting: {
      get() {
        const val = [];
        if (this.$store.state.settings.menuDefaultOpen) {
          val.push('open');
        }
        if (this.$store.state.settings.menuAccordion) {
          val.push('accordion');
        }
        return val;
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'menuDefaultOpen',
          value: val.includes('open'),
        });
        this.$store.dispatch('settings/changeSetting', {
          key: 'menuAccordion',
          value: val.includes('accordion'),
        });
      },
    },
    cardIconShape: {
      get() {
        return this.$store.state.settings.cardIconShape
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'cardIconShape',
          value: val,
        });
      },
    },
    cardSize: {
      get() {
        return this.$store.state.settings.cardSize
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'cardSize',
          value: val,
        });
      },
    },
  },
  methods: {
    handleTheme(val) {
      this.$store.dispatch('settings/changeSetting', {
        key: 'sideTheme',
        value: val
      })
      this.sideTheme = val;
    },
    saveSetting() {
      this.$modal.loading("正在保存到本地，请稍候...");
      this.$cache.local.set(
        "layout-setting",
        `{
            "sideTheme":"${this.sideTheme}",
            "menuDefaultOpen":"${this.$store.state.settings.menuDefaultOpen}",
            "menuAccordion":"${this.$store.state.settings.menuAccordion}",
            "cardIconShape":"${this.$store.state.settings.cardIconShape}",
            "cardSize":"${this.$store.state.settings.cardSize}"
          }`
      );
      setTimeout(() => this.$modal.closeLoading(), 1000)
    },
    resetSetting() {
      this.$modal.loading("正在清除设置缓存并刷新，请稍候...");
      this.$cache.local.remove("layout-setting")
      setTimeout("window.location.reload()", 1000)
    },
    handleOfflineChange(val) {
      this.$offlineCache.setEnabled(val)
      this.cacheInfo = this.$offlineCache.getCacheInfo()
      if (val) {
        this.$modal.msgSuccess('已启用离线缓存')
      } else {
        this.$modal.msgSuccess('已关闭离线缓存')
      }
    },
    syncData() {
      this.$modal.loading('正在同步数据，请稍候...')
      this.$store.dispatch('home/loadHomeCards').then(() => {
        this.cacheInfo = this.$offlineCache.getCacheInfo()
        this.$modal.closeLoading()
        this.$modal.msgSuccess('数据同步成功')
      }).catch(() => {
        this.$modal.closeLoading()
        this.$modal.msgError('数据同步失败，请检查网络')
      })
    },
    clearCache() {
      this.$modal.confirm('确定要清除离线缓存吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$offlineCache.clearAllCache()
        this.cacheInfo = this.$offlineCache.getCacheInfo()
        this.$modal.msgSuccess('缓存已清除')
      }).catch(() => {})
    },
    async getSwCacheInfo() {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        let totalSize = 0
        let totalEntries = 0
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName)
          const requests = await cache.keys()
          totalEntries += requests.length
          for (const request of requests) {
            const response = await cache.match(request)
            if (response) {
              const blob = await response.clone().blob()
              totalSize += blob.size
            }
          }
        }
        this.swCacheInfo = {
          keys: totalEntries,
          size: this.formatSize(totalSize)
        }
      }
    },
    formatSize(bytes) {
      if (bytes < 1024) {
        return bytes + ' B'
      }
      if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB'
      }
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    },
    handleSwCacheChange(val) {
      if (val) {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/service-worker.js').then(() => {
            this.$modal.msgSuccess('ServiceWorker 缓存已启用')
          }).catch(err => {
            this.swCacheEnabled = false
            this.$modal.msgError('ServiceWorker 注册失败: ' + err.message)
          })
        }
      } else {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then(registration => {
            if (registration) {
              registration.unregister().then(() => {
                this.$modal.msgSuccess('ServiceWorker 缓存已禁用')
              })
            }
          })
        }
      }
    },
    updateSwCache() {
      this.$modal.loading('正在更新缓存，请稍候...')
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration) {
            registration.update().then(() => {
              this.getSwCacheInfo()
              this.$modal.closeLoading()
              this.$modal.msgSuccess('缓存更新成功')
            }).catch(err => {
              this.$modal.closeLoading()
              this.$modal.msgError('缓存更新失败: ' + err.message)
            })
          } else {
            this.$modal.closeLoading()
            this.$modal.msgError('未找到 ServiceWorker，请先启用缓存')
          }
        })
      } else {
        this.$modal.closeLoading()
        this.$modal.msgError('当前浏览器不支持 ServiceWorker')
      }
    },
    clearSwCache() {
      this.$modal.confirm('确定要清除 ServiceWorker 缓存吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
          this.swCacheInfo = { keys: 0, size: '0 B' }
          this.$modal.msgSuccess('ServiceWorker 缓存已清除')
        }
      }).catch(() => {})
    }
  },
  mounted() {
    this.getSwCacheInfo()
  }
}
</script>

<style lang="scss" scoped>
.setting-drawer-content {
  .setting-drawer-title {
    margin-bottom: 12px;
    color: rgba(0, 0, 0, .85);
    font-size: 14px;
    line-height: 22px;
    font-weight: bold;
  }

  .setting-drawer-block-checbox {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 20px;

    .setting-drawer-block-checbox-item {
      position: relative;
      margin-right: 16px;
      border-radius: 2px;
      cursor: pointer;

      img {
        width: 48px;
        height: 48px;
      }

      .setting-drawer-block-checbox-selectIcon {
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        padding-top: 15px;
        padding-left: 24px;
        color: #1890ff;
        font-weight: 700;
        font-size: 14px;
      }
    }
  }
}

.drawer-container {
  padding: 20px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;

  .drawer-title {
    margin-bottom: 12px;
    color: rgba(0, 0, 0, .85);
    font-size: 14px;
    line-height: 22px;
  }

  .drawer-item {
    color: rgba(0, 0, 0, .65);
    font-size: 14px;
    padding: 12px 0;
    display: flex;
    justify-content: space-between;
  }
}

.offline-info {
  margin-top: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;

  .drawer-item {
    padding: 8px 0;
  }
}

.offline-buttons {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
</style>
