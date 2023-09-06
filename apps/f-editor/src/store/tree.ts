/*
 * @Date: 2023-08-21 00:15:34
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-06 16:20:52
 * @FilePath: /threejs-demo/apps/f-editor/src/store/tree.ts
 */

import { Node } from "@/engine/Node";
import { defineStore } from "pinia";

const useTreeStore = defineStore({
    id: "Tree",
    state: () => ({
        root: new Node('root'),
    }),
    getters: {
        currentTree: (state) => state.root
    },
    actions: {
        resetTree() {
            this.root.label = 'Scene'
            this.root.clear();
        },

        createNode(typeName: string, attribute = {}) {
            return new Node(typeName, attribute);
        }
    }
})

export { useTreeStore }