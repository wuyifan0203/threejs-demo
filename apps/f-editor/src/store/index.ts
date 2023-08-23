/*
 * @Date: 2023-08-20 23:49:06
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-24 01:38:13
 * @FilePath: /threejs-demo/apps/f-editor/src/store/index.ts
 */
import { useAppStore } from "./modules/app"
import { useCADStore } from "./modules/cad"

const store = {
    get cadStore() {
        return useCADStore()
    },
    get appStore() {
        return useAppStore()
    },

    resetStore() {
        this.cadStore.$reset();
        this.appStore.$reset();
    }
}

export { store }