// import { createApp } from 'vue'
// import App from './App.vue'

// createApp(App).mount('#app')

// micro-app-main/src/routes/index.ts
import Home from "@/pages/home/index.vue";

const routes = [
  {
    /**
     * path: 路径为 / 时触发该路由规则
     * name: 路由的 name 为 Home
     * component: 触发路由时加载 `Home` 组件
     */
    path: "/",
    name: "Home",
    component: Home,
  },
];

export default routes;

// micro-app-main/src/main.ts
//...
import Vue from "vue";
import VueRouter from "vue-router";

import routes from "./routes";

/**
 * 注册路由实例
 * 即将开始监听 location 变化，触发路由规则
 */
const router = new VueRouter({
  mode: "history",
  routes,
});

// 创建 Vue 实例
// 该实例将挂载/渲染在 id 为 main-app 的节点上
new Vue({
  router,
  render: (h) => h(App),
}).$mount("#main-app");