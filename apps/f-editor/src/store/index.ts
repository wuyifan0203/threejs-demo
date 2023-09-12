/*
 * @Date: 2023-08-20 23:49:06
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-12 15:06:51
 * @FilePath: /threejs-demo/apps/f-editor/src/store/index.ts
 */
import { useAppStore } from "./app";
import { useCADStore } from "./cad";
import { useProjectStore } from "./project";
import { useTreeStore } from "./tree";

const store = {
    get cad() {
        return useCADStore()
    },
    get app() {
        return useAppStore()
    },
    get tree(){
        return useTreeStore()
    },

    get project(){
        return useProjectStore()
    },

    resetStore() {
        this.cad.$reset();
        this.app.$reset();
        this.tree.$reset();
        this.project.$reset();
    }
}

export { store }