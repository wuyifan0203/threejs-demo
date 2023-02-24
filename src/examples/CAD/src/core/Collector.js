import { Object3D, Scene } from "../lib/three.module.js";

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
        this.geometrys = new Map();
        this._exclusion = []
        this.pool = [];
    }


    set exclusion(newValue){
        this._exclusion = newValue;
        this.textures.clear();
        this.materials.clear();
        this.geometrys.clear();
        this.pool.length = 0;
        this.scene.children.forEach(obj=>this.track(obj,true));
    }



    track(object3D,isAdded = false){
        !isAdded && this.scene.add(object3D);
        currentAncestorId = object3D.id;
        this.collect(object3D);
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
            this.geometrys.set(new Tip(selfId,currentParentId,currentAncestorId),object.geometry);
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

    clear(){


    }

    dispose(){

    }

    findType(){

    }

    findById(){

    }
}