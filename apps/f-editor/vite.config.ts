/*
 * @Date: 2023-05-19 19:45:13
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-02 00:57:57
 * @FilePath: /threejs-demo/apps/f-editor/vite.config.ts
 */
import { defineConfig } from "vite";
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx()
  ],
  server: {
    host: '0.0.0.0',
    port:3000
  }
})