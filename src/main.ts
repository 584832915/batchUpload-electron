import { createApp } from 'vue'
import App from './App.vue'
import router from "./router/index";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import dayjs from "dayjs";

const app = createApp(App)
app.config.globalProperties.dayjs = dayjs;
app.use(router).use(ElementPlus).mount("#app");
