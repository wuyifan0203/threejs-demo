/*
 * @Date: 2023-08-24 19:33:08
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-18 20:56:58
 * @FilePath: /threejs-demo/apps/f-editor/src/utils/eventBus.ts
 */


import { DynamicForm } from '@/engine/Form';
import mitt,{Emitter} from 'mitt';

type Events = {
    changeTheme:string
    createMeshNode:DynamicForm
}

const emitter:Emitter<Events> = mitt<Events>();



export { emitter };