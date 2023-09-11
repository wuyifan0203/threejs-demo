/*
 * @Date: 2023-09-11 20:26:39
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-11 20:29:05
 * @FilePath: /threejs-demo/apps/f-editor/components.d.ts
 */
import Icon from '@/components/Icon/index.vue'
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    Icon: typeof Icon
  }
}
