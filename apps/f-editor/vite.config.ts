/*
 * @Date: 2023-05-19 19:45:13
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-15 01:02:02
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
    port:3000,
    open:true
  },
  css:{
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/assets/scss/global.scss";`
      }
    }
  }
})
