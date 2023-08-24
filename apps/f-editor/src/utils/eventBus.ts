/*
 * @Date: 2023-08-24 19:33:08
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-24 19:43:43
 * @FilePath: /threejs-demo/apps/f-editor/src/utils/eventBus.ts
 */


import mitt,{Emitter} from 'mitt';

type Events = {
    changeTheme:string
}

const emitter:Emitter<Events> = mitt<Events>();



export { emitter };