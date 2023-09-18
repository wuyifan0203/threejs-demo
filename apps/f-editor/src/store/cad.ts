/*
 * @Date: 2023-08-21 00:15:34
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-18 17:56:02
 * @FilePath: /threejs-demo/apps/f-editor/src/store/cad.ts
 */

import { getCadInstance } from "@/engine/instance";
import { OptionMode } from "@f/engine";
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
        },

        setSize() {
            getCadInstance().setSize()
        },

        addObject(object: Object3D, parent = null, index = null) {
            getCadInstance().addObject(object, parent, index)
        },

        setOptionMode(mode:OptionMode){
            getCadInstance().setOptionMode(mode);
        }
    }
})

export { useCADStore }