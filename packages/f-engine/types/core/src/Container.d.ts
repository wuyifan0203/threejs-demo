import type { BufferGeometry, Camera, Light, Material, Object3D, Texture } from "three";
declare class Container {
    cameras: Map<string, Camera>;
    lights: Map<string, Light>;
    objects: Map<string, Object3D>;
    geometries: Map<string, BufferGeometry>;
    materials: Map<string, Material>;
    helpers: Map<string, Object3D>;
    textures: Map<string, Texture>;
    private geometriesRefCounter;
    private materialsRefCounter;
    private texturesRefCounter;
    constructor();
    addCamera(key: string, camera: Camera): void;
    removeCamera(camera: Camera): void;
    addLight(key: string, light: Light): void;
    removeLight(light: Light): void;
    addObject(object: Object3D): void;
    removeObject(object: Object3D): void;
    getObjectByUuid(uuid: string): Object3D<import("three").Event> | undefined;
    addGeometry(geometry: BufferGeometry): void;
    removeGeometry(geometry: BufferGeometry): void;
    getGeometryByUUID(uuid: string): BufferGeometry<import("three").NormalBufferAttributes> | undefined;
    addMaterial(material: Material | Material[]): void;
    removeMaterial(material: Material | Material[]): void;
    getMaterialByUUID(uuid: string): Material | undefined;
    addTexture(texture: Texture): void;
    removeTexture(texture: Texture): void;
    getTextureByUUID(uuid: string): Texture | undefined;
    addHelper(key: string, helper: Object3D): void;
    removeHelper(helper: Object3D): void;
    getHelperByKey(key: string): Object3D<import("three").Event> | undefined;
    addObjectToRefCounter(object: Texture | BufferGeometry | Material, counter: Map<string, number>, map: Map<string, Material | Texture | BufferGeometry>): void;
    removeObjectToRefCounter(object: Texture | BufferGeometry | Material, counter: Map<string, number>, map: Map<string, Material | Texture | BufferGeometry>): void;
}
export { Container };