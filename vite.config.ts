/*
 * @Date: 2024-02-01 16:01:31
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-12-18 11:29:20
 * @FilePath: \threejs-demo\vite.config.ts
 */
import { defineConfig } from 'vite';
export default defineConfig({
    root:'./',
    base:'/threejs-demo/',
    plugins:[
    ],
    server:{
        port:6500
    },
    build:{
        outDir:'dist',
    }
})
