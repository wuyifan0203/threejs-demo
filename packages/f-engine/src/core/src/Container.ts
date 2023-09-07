/*
 * @Date: 2023-06-13 13:06:55
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-07 21:01:20
 * @FilePath: /threejs-demo/packages/f-engine/src/core/src/Container.ts
 */
import type { BufferGeometry, Camera, Light, Material, Object3D, Texture } from "three";
class Container {
  public cameras: Map<string, Camera>
  public lights: Map<string, Light>
  public objects: Map<string, Object3D>
  public geometries: Map<string, BufferGeometry>
  public materials: Map<string, Material>
  public helpers: Map<string, Object3D>
  public textures: Map<string, Texture>

  private geometriesRefCounter: Map<string, number>
  private materialsRefCounter: Map<string, number>
  private texturesRefCounter: Map<string, number>

  constructor() {
    this.cameras = new Map();
    this.lights = new Map();
    this.objects = new Map();
    this.geometries = new Map();
    this.materials = new Map();
    this.helpers = new Map();
    this.textures = new Map();

    this.geometriesRefCounter = new Map();
    this.materialsRefCounter = new Map();
    this.texturesRefCounter = new Map();
  }

  // camera
  addCamera(key: string, camera: Camera) {
    this.cameras.set(key, camera);
  }

  removeCamera(camera: Camera) {
    this.cameras.delete(camera?.uuid);
  }

  // light
  addLight(key: string, light: Light) {
    this.lights.set(key, light);
  }

  removeLight(light: Light) {
    this.lights.delete(light?.uuid);
  }

  // object

  addObject(object: Object3D|any) {
    if (object?.isObject3D) {
      this.objects.set(object.uuid, object);
      if (object?.isCamera) {
        // this.addCamera()
      }
    } else {
      console.error('Container.addObject: object not an instance of THREE.Object3D.', object);
    }
  }

  removeObject(object: Object3D) {
    this.objects.delete(object?.uuid);
  }

  getObjectByUuid(uuid: string) {
    return this.objects.get(uuid);
  }

  // geometry

  addGeometry(geometry: BufferGeometry) {
    if (geometry?.isBufferGeometry) {
      this.addObjectToRefCounter(geometry, this.geometriesRefCounter, this.geometries);
    } else {
      console.error('.Container.addGeometry: object not an instance of THREE.BufferGeometry.', geometry);
    }
  }

  removeGeometry(geometry: BufferGeometry) {
    this.removeObjectToRefCounter(geometry, this.geometriesRefCounter, this.geometries);
  }

  getGeometryByUUID(uuid: string) {
    return this.geometries.get(uuid);
  }

  // material

  addMaterial(material: Material | Material[]) {
    if (Array.isArray(material)) {
      for (let i = 0, l = material.length; i < l; i++) {
        if (material[i]?.isMaterial) {
          this.addObjectToRefCounter(material[i], this.materialsRefCounter, this.materials);
        } else {
          console.error('Container.addMaterial: object not an instance of THREE.Material in Material Array.', material[i]);
          break;
        }
      }
    } else if (material?.isMaterial) {
      this.addObjectToRefCounter(material, this.materialsRefCounter, this.materials);
    } else {
      console.error('Container.addMaterial: object not an instance of THREE.Material.', material);
    }
  }

  removeMaterial(material: Material | Material[]) {
    if (Array.isArray(material)) {
      for (let i = 0, l = material.length; i < l; i++) {
        this.removeObjectToRefCounter(material[i], this.materialsRefCounter, this.materials);
      }
    } else {
      this.removeObjectToRefCounter(material, this.materialsRefCounter, this.materials);
    }
  }

  getMaterialByUUID(uuid: string) {
    return this.materials.get(uuid);
  }

  // texture

  addTexture(texture: Texture) {
    if (texture?.isTexture) {
      this.addObjectToRefCounter(texture, this.texturesRefCounter, this.textures);
    } else {
      console.error('Container.addTexture: object not an instance of THREE.Texture.', texture);
    }
  }

  removeTexture(texture: Texture) {
    this.removeObjectToRefCounter(texture, this.texturesRefCounter, this.textures);
  }

  getTextureByUUID(uuid: string) {
    return this.textures.get(uuid);
  }

  // helper

  private addHelper(key: string, helper: Object3D) {
    this.helpers.set(key, helper);
  }

  private removeHelper(helper: Object3D) {
    if (this.helpers.has(helper?.uuid)) {
      this.helpers.delete(helper.uuid);
    }
  }

  getHelperByKey(key: string) {
    return this.helpers.get(key);
  }

  // counter

  private addObjectToRefCounter(object: Texture | BufferGeometry | Material, counter: Map<string, number>, map: Map<string, Material | Texture | BufferGeometry>) {
    let count = counter.get(object.uuid);

    if (count === undefined) {
      map.set(object.uuid, object);
      counter.set(object.uuid, 1);
    } else {
      counter.set(object.uuid, count++);
    }
  }

  private removeObjectToRefCounter(object: Texture | BufferGeometry | Material, counter: Map<string, number>, map: Map<string, Material | Texture | BufferGeometry>) {
    let count = counter.get(object.uuid);

    if (count) {
      count--;
      if (count === 0) {
        counter.delete(object.uuid);
        map.delete(object.uuid);
      } else {
        counter.set(object.uuid, count);
      }
    }

  }
}

export { Container };
