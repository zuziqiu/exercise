import { createApp } from "vue";
import App from "./App.vue";
// 在入口文件中（main.js），导入组件库
import {vueHashCalendar} from "vue3-hash-calendar";
// 引入组件CSS样式
import "vue3-hash-calendar/lib/style.css";

const _app = createApp(App);
_app.use(vueHashCalendar);
_app.mount("#app");
