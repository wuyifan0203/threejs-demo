/*
 * @Date: 2023-06-13 13:06:55
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-27 14:40:11
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Container.js
 */
class Container {
  constructor() {
    this.cameras = new Map();
    this.lights = new Map();
    this.objects = new Map();
    this.geometries = new Map();
    this.materials = new Map();
    this.helpers = new Map();
    this.textures = new Map();

    this.geometriesRefCounter = new Map()
    this.materialsRefCounter = new Map();
    this.texturesRefCounter = new Map()
  }

  // camera
  addCamera(camera) {
    if (camera?.isCamera) {
      this.cameras.set(camera.uuid, camera);
    } else {
      console.error("Editor.Container.addCamera: object not an instance of THREE.Camera.",camera);
    }
  }

  removeCamera(camera) {
    this.cameras.delete(camera?.uuid);
  }

  // light
  addLight(light) {
    if (light?.isLight) {
      this.lights.set(lights.uuid, lights);
    } else {
      console.error("Editor.Container.addLight: object not an instance of THREE.Light.",light);
    }
  }

  removeLight(light) {
    this.lights.delete(light?.uuid);
  }

  // object

  addObject(object) {
    if (object?.isObject3D) {
      this.objects.set(object.uuid, object);
    } else {
      console.error("Editor.Container.addObject: object not an instance of THREE.Object3D.",object);
    }
  }

  removeObject(object) {
    this.objects.delete(object?.uuid);
  }

  getObjectByUUID(uuid){
    return this.objects.get(uuid)
  }

  // geometry

  addGeometry(geometry) {
    if(geometry?.isBufferGeometry){
      this.addObjectToRefCounter(geometry,this.geometriesRefCounter,this.geometries);
    }else{
      console.error("Editor.Container.addGeometry: object not an instance of THREE.BufferGeometry.",geometry);
    }
  }

  removeGeometry(geometry) {
    this.removeObjectToRefCounter(geometry,this.geometriesRefCounter,this.geometries);
  }

  getGeometryByUUID(uuid){
    return this.geometries.get(uuid)
  }

  // material

  addMaterial(material) {
    if (Array.isArray(material)) {
      for (let i = 0, l = material.length; i < l; i++) {
        if(material[i]?.isMaterial){
          this.addObjectToRefCounter(material[i],this.materialsRefCounter,this.materials);
        }else{
          console.error("Editor.Container.addMaterial: object not an instance of THREE.Material in Material Array.",material[i]);
          break;
        }
      }
    } else {
      if(material?.isMaterial){
        this.addObjectToRefCounter(material,this.materialsRefCounter,this.materials);
      }else{
        console.error("Editor.Container.addMaterial: object not an instance of THREE.Material.",material);
      }
    }
  }

  removeMaterial(material){
    if (Array.isArray(material)) {
      for (let i = 0, l = material.length; i < l; i++) {
        this.removeObjectToRefCounter(material[i],this.materialsRefCounter,this.materials);
      }
    } else {
      this.removeObjectToRefCounter(material,this.materialsRefCounter,this.materials);
    }
  }

  getMaterialByUUID(uuid){
    return this.materials.get(uuid)
  }

  // texture

  addTexture(texture) {
    if (texture?.isTexture) {
      this.addObjectToRefCounter(texture,this.texturesRefCounter,this.textures);
    } else {
      console.error("Editor.Container.addTexture: object not an instance of THREE.Texture.",texture);
    }
  }

  removeTexture(texture) {
    this.removeObjectToRefCounter(texture,this.texturesRefCounter,this.textures);
  }

  getTextureByUUID(uuid){
    return this.textures.get(uuid)
  }

  // helper

  addHelper(helper) {
    this.helpers.set(helper?.uuid, helper);
  }

  removeHelper(helper) {
    if (this.helpers.has(helper?.uuid)) {
      this.helpers.delete(helper.uuid);
    }
  }

  getHelperByUUID(uuid){
    return this.helpers.get(uuid)
  }

  // counter

  addObjectToRefCounter(object,counter,map){
    let count = counter.get(object.uuid);
    if (count === undefined) {
      map.set(object.uuid, object);
      counter.set(object.uuid, 1);
    } else {
      counter.set(object.uuid, count++);
    }
  }

  removeObjectToRefCounter(object,counter,map){
    let count = counter.get(object.uuid);
    count--;
    if(count === 0){
      counter.delete(object.uuid);
      map.delete(object.uuid)
    }else{
      counter.set(object.uuid,count);
    }
  }
}

export { Container };
