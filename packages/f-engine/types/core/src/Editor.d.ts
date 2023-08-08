import { EventDispatcher } from '@f/utils';
import { SignalTypes, SignalsMap } from '../../types/SignalTypes';
import { Scene } from 'three';
declare class Editor extends EventDispatcher {
    private state;
    private selector;
    signals: SignalTypes<SignalsMap>;
    domElement: HTMLElement;
    scene: Scene;
    sceneHelper: Scene;
    constructor(domElement: HTMLElement);
    addObject(object: any, parent: any, index: any): void;
    addCamera(camera: any): void;
    removeCamera(camera: any): void;
    addGeometry(geometry: any): void;
    removeGeometry(geometry: any): void;
    addMaterial(material: any): void;
    removeMaterial(material: any): void;
    removeObject(object: any): void;
    removeObjectByUuid(uuid: any): void;
    getObjectByUuid(uuid: any, isGlobal?: boolean): import("three").Object3D<import("three").Event> | undefined;
    getObjectsByProperty(key: any, value: any): import("three").Object3D<import("three").Event>[];
    setState(key: any, value: any): void;
    getState(key: any): any;
    select(object: any): void;
    selectById(uuid: any): void;
    setSceneBackground(background: any): void;
}
export { Editor };
