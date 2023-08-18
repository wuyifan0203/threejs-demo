/*
 * @Date: 2023-06-09 11:05:53
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-18 19:28:39
 * @FilePath: /threejs-demo/apps/f-editor/src/main.ts
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia'
import App from './App.vue';

const pinia = createPinia()

const app = createApp(App);
app.use(pinia);
app.mount('#app')
