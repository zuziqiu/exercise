import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path, { dirname } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // process.cwd() 是当前Node.js进程执行时的文件夹地址——工作目录
  loadEnv(mode, process.cwd());
  return {
    base: "./",
    plugins: [vue()],
    server: {
      port: 3001, // 设置服务启动端口号
      open: true, // 设置服务启动时是否自动打开浏览器
    },
  };
});
