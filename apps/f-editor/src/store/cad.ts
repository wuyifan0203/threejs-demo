/*
 * @Date: 2023-08-21 00:15:34
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-26 20:58:32
 * @FilePath: /threejs-demo/apps/f-editor/src/store/cad.ts
 */

import { defineStore } from "pinia";
import { getCadInstance } from "@/engine/instance";
import type { OptionModeType } from "@f/engine";
import { TreeNode } from "@/engine/Node";
import { Color, Material } from "three";
import { Geometries, Materials, Meshes } from "@/engine/Factory";
import { store } from ".";


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
            this.resetCamera()


            this.setBackgroundColor('#ffffff')

            this.setActive(true);
        },

        createMesh(node: TreeNode) {
            if(node.type === "Mesh"){
                const {geometryOptions,materialOptions} = node.getAttribute()
                const mesh = Meshes.createMesh(geometryOptions,materialOptions);
                mesh.name = node.name;
                mesh.uuid = node.id;

                if(Array.isArray(materialOptions)){
                    materialOptions.forEach((option)=>{
                        const materialNode =  store.tree.createNode('Material',{option});
                        (mesh.material as Material).uuid = materialNode.id;
                        store.tree.materialTree.add(materialNode);
                    })
                }else{
                    const materialNode =  store.tree.createNode('Material',{materialOptions});
                    (mesh.material as Material).uuid = materialNode.id;
                    store.tree.materialTree.add(materialNode);
                }
   
                const geometryNode =  store.tree.createNode('Geometry',{geometryOptions});
                mesh.geometry.uuid = geometryNode.id;
                store.tree.geometryTree.add(geometryNode);

                return mesh;
            }
        },

        createMaterial(node: TreeNode) {
            if(node.type === "Material"){
                const {materialOptions} = node.getAttribute()
                const material = Materials.createMaterial(materialOptions) as Material;
                material.name = node.name;
                material.uuid = node.id;
                return material;
            }
        },

        createGeometry(node: TreeNode) {
            if(node.type === "Geometry"){
                const {geometryOptions} = node.getAttribute()
                const geometry = Geometries.createGeometry(geometryOptions);
                geometry.name = node.name;
                geometry.uuid = node.id;
                return geometry;
            }
        },

      

        setSize() {
            getCadInstance().setSize()
        },

        addObject(node: TreeNode, parent:null|TreeNode = null, index = null) {
            const object = this.createMesh(node);
            console.log(object);
            
            if(object){
                if(parent){
                    const parentObject = this.getObject3DByUuid(parent.id);
                    if(parentObject){
                        getCadInstance().addObject(object, parentObject, index)
                    }else{
                        console.log("no found parent when add",parent.id);
                    }
                   
                }else{
                    getCadInstance().addObject(object, null, index)
                }
            }else{
                console.log("no found object when add",node.id);
            }
        },

        setOptionMode(mode:OptionModeType){
            getCadInstance().setOptionMode(mode);
        },

        setActive(active: boolean){
            getCadInstance().setActive(active);
        },

        resetCamera(){
            getCadInstance().resetCamera();
        },

        setBackgroundColor(color:string){
            getCadInstance().setBackgroundColor(new Color(color));
        },

        getObject3DByUuid(uuid:string){
            return getCadInstance().container.getObjectByUuid(uuid);
        }
    }
})

export { useCADStore }