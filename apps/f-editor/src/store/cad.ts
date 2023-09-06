/*
 * @Date: 2023-08-21 00:15:34
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-21 00:58:46
 * @FilePath: /threejs-demo/apps/f-editor/src/store/modules/cad.ts
 */

import { Instance } from "@/engine/instance";
import { defineStore } from "pinia";

const useCADStore = defineStore({
    id: "cad",
    state: () => ({}),
    getters: {},
    actions: {
        setupCAD(){
            const instance = Instance.getInstance();
            instance.setSize()

        },

        setSize(){
            Instance.getInstance().setSize()
        }
    }
})

export {useCADStore}