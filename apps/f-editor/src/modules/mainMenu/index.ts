/*
 * @Date: 2023-09-26 20:21:38
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-18 20:56:34
 * @FilePath: /threejs-demo/apps/f-editor/src/modules/mainMenu/index.ts
 */
import { DynamicForm } from '@/engine/Form';
import { store } from '@/store';
import { emitter } from '@/utils';

const menuClickEvent = {
    cube() {
        const node = store.tree.createNode('Mesh', {type: 'cube'})
        emitter.emit('createMeshNode',new DynamicForm('Cube',node))
        store.tree.appendNode(node);
    },
    sphere(){
        const node = store.tree.createNode('Mesh', {type: 'sphere'})
        store.tree.appendNode(node);
    },
    cylinder(){
        const node = store.tree.createNode('Mesh', {type: 'cylinder'})
        store.tree.appendNode(node);
    }
}

export { menuClickEvent }