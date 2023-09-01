/*
 * @Date: 2023-05-19 19:45:13
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-01 13:12:25
 * @FilePath: /threejs-demo/apps/f-editor/vite.config.ts
 */
import { defineConfig } from "vite";
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx()
  ],
  resolve: {
    // 配置路径别名
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port:3000,
    open:true
  },
  base:'./',
  build:{
    outDir:'./dist',
    emptyOutDir:true,
    sourcemap:false,
    minify:false,
  },
  css:{
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/assets/scss/global.scss";`
      }
    }
  }
})
