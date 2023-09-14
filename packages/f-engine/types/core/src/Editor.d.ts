import { EventDispatcher } from '@f/utils';
import { SignalTypes, SignalsMap } from '../../types/SignalTypes';
import { Color, type Object3D, Scene, Texture } from 'three';
declare class Editor extends EventDispatcher {
    private state;
    private selector;
    signals: SignalTypes<SignalsMap>;
    sceneBackground: Scene;
    scene: Scene;
    sceneHelper: Scene;
    private _needsUpdate;
    constructor();
    get needsUpdate(): boolean;
    set needsUpdate(value: boolean);
    addObject(object: Object3D, parent?: Object3D | null, index?: number | null): void;
    removeObject(object: Object3D): void;
    removeObjectByUuid(uuid: string): void;
    getObjectByUuid(uuid: string): Object3D<import("three").Event> | undefined;
    getObjectsByProperty(key: string, value: any): Object3D<import("three").Event>[];
    addHelper(helper: Object3D): void;
    setState(key: string, value: any): void;
    getState(key: string): any;
    select(object: Object3D[]): void;
    selectByIds(uuids: Array<string> | undefined): void;
    setSceneBackground(background: Color | Texture | null): void;
}
export { Editor };
