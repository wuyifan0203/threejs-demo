/*
 * @Date: 2023-08-21 00:15:34
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-08 20:45:13
 * @FilePath: /threejs-demo/apps/f-editor/src/store/tree.ts
 */

import { TreeNode } from "@/engine/Node";
import { defineStore } from "pinia";
import { store } from "@/store";

const useTreeStore = defineStore({
    id: "tree",
    state: () => ({
        root: new TreeNode('Root'),
        materials: new TreeNode('Materials'),
        geometries: new TreeNode('Geometries')
    }),
    getters: {
        sceneTree: (state) => state.root,
        materialTree: (state) => state.materials,
        geometryTree: (state) => state.geometries,
    },
    actions: {
        resetTree() {
            this.root.name = 'Scene'
            this.root.clear();

            const light = this.createNode('Light', { type: 'ambient' });
            light.name = 'Light';
            const directional = this.createNode('Light', { type: 'directional' });
            directional.name = 'directional';
            const camera = this.createNode('Camera', { type: 'perspective' });
            camera.name = 'Camera';
            
            this.appendNode(light);
            this.appendNode(directional);
            this.appendNode(camera);


        },

        createNode(typeName: string, attribute = {}): TreeNode {
            const node = new TreeNode(typeName, attribute);
            node.name = typeName;
            return node;
        },

        appendNode(node: TreeNode, parentNode: TreeNode = store.tree.root) {
            parentNode.add(node);
            if (parentNode === this.root) {
                store.cad.addObject(node, null)
            } else {
                store.cad.addObject(node, parentNode)
            }
        }


    }
})

export { useTreeStore }