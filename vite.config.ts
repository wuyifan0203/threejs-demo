/*
 * @Date: 2024-02-01 16:01:31
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-02-01 16:09:15
 * @FilePath: /threejs-demo/vite.config.ts
 */
import { defineConfig } from 'vite';
export default defineConfig({
    root:'./',
    base:'/threejs-demo/',
    server:{
        port:6600
    },
    build:{
        outDir:'docs',
    }
})
