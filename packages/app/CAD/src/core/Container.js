import { Scene } from "three";
class Container {
  constructor() {
    this.scene = new Scene();
    this.cameras = {};
    this.lights = {};
    this.objects = {};
    this.geometries = {};
    this.materials = {};
    this.helpers = {};
    this.groups = {};
    this.textures = {};
  }

  conllect(object) {
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

  add(object) {
    this.scene.add(object);
  }

  remove(object) {
    this.scene.remove(object);
  }
}

export { Container };
