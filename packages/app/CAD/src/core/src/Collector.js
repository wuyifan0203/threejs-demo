/*
 * @Date: 2023-04-03 18:22:31
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 13:22:53
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Collector.js
 */
import { Scene } from "three";

let currentAncestorId = null;
let currentParentId = null;
let selfId = null;

class Tip {
    constructor(selfId,parentId,ancestorId){
        this.id = selfId;
        this.parentId = parentId;
        this.ancestorId = ancestorId;
    }
}

export class Collector{
    constructor(){
        this.scene = new Scene()
        this.textures = new Map();
        this.materials = new Map();
        this.geometries = new Map();
        this._exclusion = []
        this.pool = [];
    }


    set exclusion(newValue){
        this._exclusion = newValue;
        this.textures.clear();
        this.materials.clear();
        this.geometries.clear();
        this.pool.length = 0;
        this.scene.children.forEach(obj=>this.track(obj,true));
    }


    track(object3D){
        this.scene.add(object3D);
        if(!this._exclusion.includes(object3D.type)){
            this.pool.push(object3D);
        }
    }

    collect(object){
        selfId = object.id;
        const isNeedCollect = object.children.length !== 0;
        if(isNeedCollect){
            object.children.forEach(o=>{
                this.collect(o);
                currentParentId = o.id;
            });
        }else{
            currentParentId = object?.parent?.id;
        }
        if(object.geometry !== undefined){
            this.geometries.set(new Tip(selfId,currentParentId,currentAncestorId),object.geometry);
        }
        if(object.material !== undefined){
            const material = object.material;
            if(Array.isArray(material)){
                material.forEach(m=>{
                    this.materials.set(new Tip(selfId,currentParentId,currentAncestorId),m);
                    this.collectTexture(m);
                })
            }else{
                this.materials.set(new Tip(selfId,currentParentId,currentAncestorId),material);
                this.collectTexture(material)
            }
        }
    }

    collectTexture(material){
        const inTextures = (texture)=>this.materials.set(new Tip(material.id,currentParentId,currentAncestorId),texture);
        material.alphaMap && inTextures(material.alphaMap);
        material.aoMap && inTextures(material.aoMap);
        material.envMap && inTextures(material.envMap);
        material.lightMap && inTextures(material.lightMap);
        material.map && inTextures(material.map);
        material.specularMap && inTextures(material.specularMap);
    }

    release(object){
        this.scene.remove(object);
        if(object.geometry){
            object.geometry.dispose()
        }
        if( object.material){
            if(Array.isArray(object.material)){
                object.material.forEach(m=>m.dispose())
            }else{
                object.material.dispose()
            }
        }
    }
}