import Vue from 'vue'

import Cookies from 'js-cookie'

import './assets/styles/element-variables.scss'
import './plugins/element' // 按需加载 Element UI

import '@/assets/styles/index.scss' // global css
import '@/assets/styles/ruoyi.scss' // ruoyi css
import App from './App'
import store from './store'
import router from './router'
import plugins from './plugins' // plugins
import directive from '@/plugins/directive'
import './assets/icons' // icon
import '@/components'
// 头部标签组件
import VueMeta from 'vue-meta'
import offlineCache from './utils/offline-cache'

Vue.use(plugins)
Vue.use(VueMeta)
Vue.use(directive)

Vue.prototype.$ELEMENT = { size: Cookies.get('size') || 'medium' } // set element-ui default size
Vue.prototype.$offlineCache = offlineCache

Vue.config.productionTip = false

// 注册 Service Worker (仅生产环境)
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('ServiceWorker 注册成功:', registration)
    }).catch(registrationError => {
      console.log('ServiceWorker 注册失败:', registrationError)
    })
  })

  // 监听网络状态变化
  window.addEventListener('online', () => {
    console.log('网络已连接')
  })
  window.addEventListener('offline', () => {
    console.log('网络已断开，将使用离线缓存')
  })
}

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
