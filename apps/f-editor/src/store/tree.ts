/*
 * @Date: 2023-08-21 00:15:34
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-12 15:13:44
 * @FilePath: /threejs-demo/apps/f-editor/src/store/tree.ts
 */

import { Node } from "@/engine/Node";
import { defineStore } from "pinia";

const useTreeStore = defineStore({
    id: "Tree",
    state: () => ({
        root: new Node('Root'),
    }),
    getters: {
        currentTree: (state) => state.root
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
        },

        createNode(typeName: string, attribute = {}) {
            return new Node(typeName, attribute);
        }
    }
})

export { useTreeStore }