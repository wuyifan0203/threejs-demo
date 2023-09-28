/*
 * @Date: 2023-09-26 20:21:38
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-28 17:13:54
 * @FilePath: /threejs-demo/apps/f-editor/src/modules/mainMenu/index.ts
 */
import { store } from '@/store';
import { CubeOptions } from '../../config/geometryOptions'
import { DefaultMaterialOptions } from '../../config/materialOptions'

const menuClickEvent = {
    cube(item) {
        const node = store.tree.createNode('Mesh', {
            geometryOptions: CubeOptions,
            materialOptions: DefaultMaterialOptions
        })
        store.tree.appendNode(node);
    }
}

export { menuClickEvent }