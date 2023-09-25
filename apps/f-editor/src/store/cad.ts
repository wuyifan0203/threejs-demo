/*
 * @Date: 2023-08-21 00:15:34
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-25 20:04:01
 * @FilePath: /threejs-demo/apps/f-editor/src/store/cad.ts
 */

import { getCadInstance } from "@/engine/instance";
import type { OptionModeType } from "@f/engine";
import { defineStore } from "pinia";
import type { Object3D } from "three";

const useCADStore = defineStore({
    id: "cad",
    state: () => ({}),
    getters: {},
    actions: {
        setupCAD() {
            const instance = getCadInstance();
            instance.setSize();

            instance.addEventListener('objectTranslate',(object,originValue,newValue) =>{
                console.log(' CAD objectTranslate',object,originValue,newValue);
            });
            instance.addEventListener('objectRotate',(object,originValue,newValue) =>{
                console.log(' CAD objectRotate',object,originValue,newValue);
            });
            instance.addEventListener('objectScale',(object,originValue,newValue) =>{
                console.log(' CAD objectScale',object,originValue,newValue);
            })

            this.setActive(true);
        },

        setSize() {
            getCadInstance().setSize()
        },

        addObject(object: Object3D, parent = null, index = null) {
            getCadInstance().addObject(object, parent, index)
        },

        setOptionMode(mode:OptionModeType){
            getCadInstance().setOptionMode(mode);
        },

        setActive(active: boolean){
            getCadInstance().setActive(active);
        }
    }
})

export { useCADStore }