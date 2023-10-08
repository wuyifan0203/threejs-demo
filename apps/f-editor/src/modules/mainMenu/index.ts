/*
 * @Date: 2023-09-26 20:21:38
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-08 20:11:19
 * @FilePath: /threejs-demo/apps/f-editor/src/modules/mainMenu/index.ts
 */
import { store } from '@/store';

const menuClickEvent = {
    cube() {
        const node = store.tree.createNode('Mesh', {type: 'cube'})
        store.tree.appendNode(node);
    },
    sphere(){
        const node = store.tree.createNode('Mesh', {type: 'sphere'})
        store.tree.appendNode(node);
    }
}

export { menuClickEvent }