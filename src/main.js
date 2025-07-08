import { createApp } from 'vue'
// import 'bootstrap/dist/css/bootstrap.min.css'
// import 'bootstrap-icons/font/bootstrap-icons.css'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'

const app = createApp(App)
app.use(createPinia()) // 註冊 Pinia
app.mount('#app')
