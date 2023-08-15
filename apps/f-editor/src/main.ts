/*
 * @Date: 2023-06-09 11:05:53
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-16 02:22:22
 * @FilePath: /threejs-demo/apps/f-editor/src/main.ts
 */

import { createApp } from 'vue';
import App from './App.vue';
import {create,NButton,NDropdown} from 'naive-ui'

const naive = create({
  components: [NButton,NDropdown],
})

const app = createApp(App);
app.use(naive);
app.mount('#app')
