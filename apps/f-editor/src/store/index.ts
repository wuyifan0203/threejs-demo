/*
 * @Date: 2023-08-20 23:49:06
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-06 16:08:01
 * @FilePath: /threejs-demo/apps/f-editor/src/store/index.ts
 */
import { useAppStore } from "./app";
import { useCADStore } from "./cad";
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

    resetStore() {
        this.cad.$reset();
        this.app.$reset();
        this.tree.$reset();
    }
}

export { store }