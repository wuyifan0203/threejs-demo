/*
 * @Date: 2024-02-01 16:01:31
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-09-05 10:10:50
 * @FilePath: /threejs-demo/vite.config.ts
 */
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy'
export default defineConfig({
    root:'./',
    base:'/threejs-demo/',
    plugins:[
        viteStaticCopy({
            targets:[
                {
                    src:'screenshots',
                    dest:'./'
                }
            ]
        })
    ],
    server:{
        port:6600
    },
    build:{
        outDir:'dist',
    }
})
