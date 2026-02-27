import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Element Plus 中文语言包
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// UnoCSS 样式
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'

// Element Plus 自定义主题
import './styles/element-theme.scss'

// 全局样式
import './styles/global.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')

