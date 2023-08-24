/*
 * @Date: 2023-08-20 23:49:06
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-24 19:47:45
 * @FilePath: /threejs-demo/apps/f-editor/src/store/index.ts
 */
import { useAppStore } from "./modules/app"
import { useCADStore } from "./modules/cad"

const store = {
    get cad() {
        return useCADStore()
    },
    get app() {
        return useAppStore()
    },

    resetStore() {
        this.cad.$reset();
        this.app.$reset();
    }
}

export { store }