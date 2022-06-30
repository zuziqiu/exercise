import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path, { dirname } from "path";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // process.cwd() 是当前Node.js进程执行时的文件夹地址——工作目录
  loadEnv(mode, process.cwd());
  return {
    base: "./",
    plugins: [vue(), visualizer()],
    build: {
      sourcemap: false,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("vue3-hash-calendar")) {
              return id
                .toString()
                .split("node_modules/")[1]
                .split("/")[0]
                .toString();
            }
            return "";
          },
        },
      },
    },
    server: {
      port: 3001, // 设置服务启动端口号
      open: true, // 设置服务启动时是否自动打开浏览器
    },
  };
});
