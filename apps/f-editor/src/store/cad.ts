/*
 * @Date: 2023-08-21 00:15:34
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-08 20:46:51
 * @FilePath: /threejs-demo/apps/f-editor/src/store/cad.ts
 */

import { defineStore } from "pinia";
import { getCadInstance } from "@/engine/instance";
import type { OptionModeType } from "@f/engine";
import { TreeNode } from "@/engine/Node";
import { Color, Material } from "three";
import { Cameras, Geometries, Lights, Materials, Meshes } from "@/engine/Factory";
import { store } from ".";


const useCADStore = defineStore({
    id: "cad",
    state: () => ({}),
    getters: {},
    actions: {
        setupCAD() {
            const instance = getCadInstance();
            instance.setSize();

            instance.addEventListener('objectTranslate', (object, originValue, newValue) => {
                console.log(' CAD objectTranslate', object, originValue, newValue);
            });
            instance.addEventListener('objectRotate', (object, originValue, newValue) => {
                console.log(' CAD objectRotate', object, originValue, newValue);
            });
            instance.addEventListener('objectScale', (object, originValue, newValue) => {
                console.log(' CAD objectScale', object, originValue, newValue);
            })
            this.resetCamera()


            this.setBackgroundColor('#ffffff')

            this.setActive(true);
        },

        createObject(node: TreeNode) {
            if (node.type === "Mesh") {
                const { type } = node.getAttribute()
                const mesh = Meshes.createMesh(type);
                mesh.name = node.name;
                mesh.uuid = node.id;

                return mesh;
            } else if (node.type === "Light") {
                const { type } = node.getAttribute()
                const light = Lights.createLight(type);
                light.name = node.name;
                light.uuid = node.id;

                return light;
            } else if (node.type === "Camera") {
                const { type } = node.getAttribute()
                const camera = Cameras.createCamera(type);
                camera.name = node.name;
                camera.uuid = node.id;

                return camera;
            }
        },

        createMaterial(node: TreeNode) {
            if (node.type === "Material") {
                const { materialOptions } = node.getAttribute()
                const material = Materials.createMaterial(materialOptions) as Material;
                material.name = node.name;
                material.uuid = node.id;
                return material;
            }
        },

        createGeometry(node: TreeNode) {
            if (node.type === "Geometry") {
                const { geometryOptions } = node.getAttribute()
                const geometry = Geometries.createGeometry(geometryOptions);
                geometry.name = node.name;
                geometry.uuid = node.id;
                return geometry;
            }
        },



        setSize() {
            getCadInstance().setSize()
        },

        addObject(node: TreeNode, parent: null | TreeNode = null, index = null) {
            const instance = getCadInstance();
            if(instance){
                const object = this.createObject(node);
                console.log(object);
    
                if (object) {
                    if (parent) {
                        const parentObject = this.getObject3DByUuid(parent.id);
                        if (parentObject) {
                            instance.addObject(object, parentObject, index)
                        } else {
                            console.log("no found parent when add", parent.id);
                        }
    
                    } else {
                        instance.addObject(object, null, index)
                    }
                } else {
                    console.log("no found object when add", node.id);
                }
            }else{
                console.log("no found instance when add");
                
            }
        },

        setOptionMode(mode: OptionModeType) {
            getCadInstance().setOptionMode(mode);
        },

        setActive(active: boolean) {
            getCadInstance().setActive(active);
        },

        resetCamera() {
            getCadInstance().resetCamera();
        },

        setBackgroundColor(color: string) {
            getCadInstance().setBackgroundColor(new Color(color));
        },

        getObject3DByUuid(uuid: string) {
            return getCadInstance().container.getObjectByUuid(uuid);
        }
    }
})

export { useCADStore }