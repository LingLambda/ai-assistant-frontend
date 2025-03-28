import { createApp } from 'vue'
import App from './App.vue'

import 'element-plus/dist/index.css'
import router from './router'
import ElementPlus from 'element-plus'
import '@/assets/fonts/fonts.css'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.mount('#app')
