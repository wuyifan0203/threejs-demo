/*
 * @Date: 2023-06-13 13:06:55
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 17:54:56
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Container.js
 */
/*
 * @Date: 2023-06-13 13:06:55
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 17:37:05
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Container.js
 */
class Container {
  constructor() {
    this.cameras = {};
    this.lights = {};
    this.objects = {};
    this.geometries = {};
    this.materials = {};
    this.helpers = {};
    this.groups = {};
    this.textures = {};
  }

  register(object) {
    if (object?.isCamera) {
      this.cameras[object.id] = object;
    } else if (object?.isLight) {
      this.lights[object.id] = object;
    } else if (object?.isBufferGeometry) {
      this.geometries[object.id] = object;
    } else if (object?.isMaterial) {
      this.materials[object.id] = object;
    } else if (object?.isHelper) {
      this.helpers[object.id] = object;
    } else if (object?.isTexture) {
      this.textures[object.id] = object;
    } else if (object?.isGroup) {
      this.groups[object.id] = object;
    }
    this.objects[object.id] = object;
  }

  discard(object) {
    if (object?.isCamera) {
      delete this.cameras[object.id];
    } else if (object?.isLight) {
      delete this.lights[object.id];
    } else if (object?.isBufferGeometry) {
      delete this.geometries[object.id];
    } else if (object?.isMaterial) {
      delete this.materials[object.id];
    } else if (object?.isHelper) {
      delete this.helpers[object.id];
    } else if (object?.isTexture) {
      delete this.textures[object.id];
    } else if (object?.isGroup) {
      delete this.groups[object.id];
    }
    delete this.objects[object.id];
  }
  
}

export { Container };
