const CACHE_KEY = 'offline_cache_'
const CACHE_TIME_KEY = CACHE_KEY + 'time'
const CACHE_ENABLED_KEY = CACHE_KEY + 'enabled'

const apiCache = {
  getCache(key) {
    if (!this.isEnabled()) {
      return null
    }
    const cacheData = localStorage.getItem(CACHE_KEY + key)
    if (cacheData) {
      try {
        return JSON.parse(cacheData)
      } catch (e) {
        return null
      }
    }
    return null
  },

  setCache(key, value) {
    if (!this.isEnabled()) {
      return
    }
    localStorage.setItem(CACHE_KEY + key, JSON.stringify(value))
    localStorage.setItem(CACHE_TIME_KEY + key, new Date().toISOString())
  },

  removeCache(key) {
    localStorage.removeItem(CACHE_KEY + key)
    localStorage.removeItem(CACHE_TIME_KEY + key)
  },

  clearAllCache() {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY)) {
        localStorage.removeItem(key)
      }
    })
  },

  getCacheTime(key) {
    return localStorage.getItem(CACHE_TIME_KEY + key)
  },

  isEnabled() {
    return localStorage.getItem(CACHE_ENABLED_KEY) === 'true'
  },

  setEnabled(enabled) {
    localStorage.setItem(CACHE_ENABLED_KEY, enabled ? 'true' : 'false')
    if (!enabled) {
      this.clearAllCache()
    }
  },

  getCacheInfo() {
    const keys = Object.keys(localStorage)
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY) && !key.endsWith('enabled'))
    let totalSize = 0
    cacheKeys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        totalSize += value.length
      }
    })
    return {
      enabled: this.isEnabled(),
      keys: cacheKeys.length,
      size: this.formatSize(totalSize),
      lastSync: this.getLastSyncTime()
    }
  },

  getLastSyncTime() {
    const keys = Object.keys(localStorage)
    const timeKeys = keys.filter(key => key.startsWith(CACHE_TIME_KEY))
    if (timeKeys.length === 0) {
      return null
    }
    const times = timeKeys.map(key => localStorage.getItem(key)).filter(Boolean)
    if (times.length === 0) {
      return null
    }
    return new Date(Math.max(...times.map(t => new Date(t)))).toISOString()
  },

  formatSize(bytes) {
    if (bytes < 1024) {
      return bytes + ' B'
    }
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB'
    }
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

export default apiCache
