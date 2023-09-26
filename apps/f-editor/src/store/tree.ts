/*
 * @Date: 2023-08-21 00:15:34
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-26 20:50:02
 * @FilePath: /threejs-demo/apps/f-editor/src/store/tree.ts
 */

import { Meshes } from "@/engine/Factory";
import { TreeNode } from "@/engine/Node";
import { defineStore } from "pinia";
import { store } from "@/store";

const useTreeStore = defineStore({
    id: "Tree",
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

            const light = this.createNode('Light', { color: 0xffffff });
            light.name = 'Light';
            const camera = this.createNode('Camera', { fov: 45 });
            camera.name = 'Camera';
            this.root.add(light);
            this.root.add(camera);

            const defaultMaterial = this.createNode('Material', { color: 0xffffff });

            this.materialTree.add(defaultMaterial);


            const defaultGeometry = this.createNode('Geometry');
            this.geometries.add(defaultGeometry)
        },

        createNode(typeName: string, attribute = {}): TreeNode {
            return new TreeNode(typeName, attribute);
        },

        appendNode(parentNode: TreeNode, node: TreeNode) {
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