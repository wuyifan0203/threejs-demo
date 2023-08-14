/*
 * @Date: 2023-06-09 11:05:53
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-15 00:43:59
 * @FilePath: /threejs-demo/apps/f-editor/src/main.ts
 */

import { createApp } from 'vue';
import AntDesignVue from 'ant-design-vue';
import App from './App.vue'

const app = createApp(App);
AntDesignVue.install(app);
app.mount('#app')
