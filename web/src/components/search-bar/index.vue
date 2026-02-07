<template>
  <div class="search-bar-fixed" v-clickoutside="closeHistory">
    <div class="search-input-wrapper">
      <el-dropdown class="engine-selector" trigger="click" @command="handleEngineChange" popper-class="engine-dropdown-popper">
        <span class="engine-name">
          <span class="engine-text">{{ currentEngine.name }}</span>
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="engine in searchEngines" :key="engine.key" :command="engine.key" :class="{ 'active-engine': currentEngineKey === engine.key }">
            <span>{{ engine.name }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <el-input ref="searchInput" v-model="keyword" class="search-input" placeholder="输入关键词搜索..." size="medium" @focus="showHistory = true" @keyup.enter.native="handleSearch" @keydown.enter.native="handleSearch" @keypress.native.stop>
        <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
      </el-input>
    </div>

    <div v-show="showHistory && searchHistory.length > 0" class="history-dropdown">
      <div class="history-header">
        <span class="history-title">搜索历史</span>
        <el-button type="text" size="mini" @click="clearAllHistory">清空全部</el-button>
      </div>
      <div class="history-list">
        <div v-for="(item, index) in searchHistory" :key="index" class="history-item" @click="searchFromHistory(item)">
          <div class="history-content">
            <span class="history-engine-name">{{ getEngineByKey(item.engine).name }}</span>
            <span class="history-keyword" :title="item.keyword">{{ item.keyword }}</span>
          </div>
          <div class="history-meta">
            <span class="history-time">{{ formatTime(item.time) }}</span>
            <i class="el-icon-close history-delete" @click.stop="deleteHistory(index)"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  data() {
    return {
      keyword: '',
      currentEngineKey: 'google',
      showHistory: false,
      searchEngines: [
        { key: 'google', name: 'Google', url: 'https://www.google.com/search?q={keyword}' },
        { key: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd={keyword}' },
        { key: 'bing', name: '必应', url: 'https://www.bing.com/search?q={keyword}' },
        { key: 'sogou', name: '搜狗', url: 'https://www.sogou.com/web?query={keyword}' },
        { key: '360', name: '360搜索', url: 'https://www.so.com/s?q={keyword}' }
      ],
      searchHistory: []
    }
  },
  computed: {
    currentEngine() {
      return this.searchEngines.find(e => e.key === this.currentEngineKey) || this.searchEngines[0]
    }
  },
  mounted() {
    this.loadSearchHistory()
    this.loadCurrentEngine()
  },
  methods: {
    getEngineByKey(key) {
      return this.searchEngines.find(e => e.key === key) || this.searchEngines[0]
    },
    handleEngineChange(key) {
      this.currentEngineKey = key
      localStorage.setItem('nav_search_engine', key)
    },
    handleSearch() {
      if (!this.keyword.trim()) return
      const keyword = this.keyword.trim()
      this.addToHistory(keyword, this.currentEngineKey)
      window.open(this.currentEngine.url.replace('{keyword}', encodeURIComponent(keyword)), '_blank')
      this.showHistory = false
    },
    searchFromHistory(item) {
      this.keyword = item.keyword
      this.currentEngineKey = item.engine
      this.handleSearch()
    },
    addToHistory(keyword, engine) {
      this.searchHistory = this.searchHistory.filter(item => !(item.keyword === keyword && item.engine === engine))
      this.searchHistory.unshift({ keyword, engine, time: new Date().toISOString() })
      if (this.searchHistory.length > 20) this.searchHistory = this.searchHistory.slice(0, 20)
      this.saveSearchHistory()
    },
    deleteHistory(index) {
      this.searchHistory.splice(index, 1)
      this.saveSearchHistory()
    },
    clearAllHistory() {
      this.$confirm('确定要清空所有搜索历史吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
        this.searchHistory = []
        this.saveSearchHistory()
      }).catch(() => {})
    },
    saveSearchHistory() {
      localStorage.setItem('nav_search_history', JSON.stringify(this.searchHistory))
    },
    loadSearchHistory() {
      const history = localStorage.getItem('nav_search_history')
      if (history) {
        try { this.searchHistory = JSON.parse(history) } catch (e) { this.searchHistory = [] }
      }
    },
    loadCurrentEngine() {
      const engine = localStorage.getItem('nav_search_engine')
      if (engine && this.searchEngines.find(e => e.key === engine)) this.currentEngineKey = engine
    },
    closeHistory() { this.showHistory = false },
    formatTime(timeStr) {
      if (!timeStr) return ''
      const diff = Date.now() - new Date(timeStr).getTime()
      const minute = 60 * 1000, hour = 60 * minute, day = 24 * hour, week = 7 * day
      if (diff < minute) return '刚刚'
      if (diff < hour) return Math.floor(diff / minute) + '分钟前'
      if (diff < day) return Math.floor(diff / hour) + '小时前'
      if (diff < week) return Math.floor(diff / day) + '天前'
      const time = new Date(timeStr)
      return `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')}`
    }
  },
  directives: {
    clickoutside: {
      bind(el, binding) {
        el._vueClickOutside_ = e => { if (!el.contains(e.target)) binding.value(e) }
        document.addEventListener('click', el._vueClickOutside_)
      },
      unbind(el) { document.removeEventListener('click', el._vueClickOutside_) }
    }
  }
}
</script>

<style lang="scss" scoped>
.search-bar-fixed {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 450px;
  z-index: 3000;

  .search-input-wrapper {
    display: flex;
    align-items: center;
    background: #f5f7fa;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    transition: border-color 0.2s;
    &:hover, &:focus-within { border-color: #409eff; }
  }

  .engine-selector {
    padding: 0 12px;
    cursor: pointer;
    border-right: 1px solid #dcdfe6;
    white-space: nowrap;
    .engine-name {
      display: flex;
      align-items: center;
      color: #606266;
      font-size: 14px;
      .engine-text { font-weight: 500; color: #409eff; }
    }
  }

  .search-input {
    flex: 1;
    ::v-deep .el-input__inner { border: none; background: transparent; padding-left: 10px; }
    ::v-deep .el-input-group__append { background: transparent; border: none; padding: 0 15px; }
  }

  .history-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 5px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    z-index: 3000;
    max-height: 400px;
    overflow-y: auto;

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      border-bottom: 1px solid #ebeef5;
      .history-title { font-size: 14px; color: #909399; }
    }

    .history-list { padding: 5px 0; }

    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      cursor: pointer;
      transition: background-color 0.2s;
      &:hover {
        background-color: #f5f7fa;
        .history-delete { opacity: 1; }
      }

      .history-content {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        margin-right: 10px;
        .history-engine-name {
          color: #409eff;
          margin-right: 8px;
          font-size: 12px;
          font-weight: 500;
          flex-shrink: 0;
          padding: 2px 6px;
          background: #ecf5ff;
          border-radius: 3px;
        }
        .history-keyword { font-size: 14px; color: #303133; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      }

      .history-meta {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        .history-time { font-size: 12px; color: #909399; margin-right: 10px; }
        .history-delete { font-size: 14px; color: #c0c4cc; cursor: pointer; opacity: 0; transition: opacity 0.2s, color 0.2s; &:hover { color: #f56c6c; } }
      }
    }
  }
}

::v-deep .engine-dropdown-popper { z-index: 3000 !important; }
::v-deep .el-dropdown-menu__item { padding: 8px 20px; &.active-engine { color: #409eff; background-color: #ecf5ff; } }

@media screen and (max-width: 768px) {
  .search-bar-fixed { width: 90%; max-width: 350px; .engine-selector { padding: 0 8px; font-size: 13px; } }
}
</style>
