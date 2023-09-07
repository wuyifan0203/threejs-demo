/*
 * @Date: 2023-06-12 23:25:01
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-07 20:10:58
 * @FilePath: /threejs-demo/packages/f-engine/src/core/src/Editor.ts
 */

import { EventDispatcher } from '@f/utils';
import { Signal } from 'signals';
import { Selector } from './Selector';
import { SignalTypes,SignalsMap } from '../../types/SignalTypes';
import { Color, Object3D, Scene, Texture } from 'three';

class Editor extends EventDispatcher {
  
  private state:{
    selections:Set<string>
    [key:string]:any
  };
  private selector:Selector
  public signals:SignalTypes<SignalsMap>;
  public sceneBackground: Scene;
  public scene:Scene;
  public sceneHelper:Scene
  private _needsUpdate: boolean;

  constructor() {
    super();
    this.state = {
      selections:new Set()
    };
    this.signals = {
      objectsSelected: new Signal(),
      intersectionsDetected: new Signal(),
      objectsAdded: new Signal(),
      sceneGraphChanged: new Signal(),
      sceneRendered: new Signal(),
      transformModeChange: new Signal(),
      objectsRemoved: new Signal(),
    };
    this.scene = new Scene();
    this.scene.name = 'main-scene'
    this.sceneHelper = new Scene();
    this.sceneHelper.name = 'scene-helper'
    this.sceneBackground = new Scene();
    this.sceneBackground.name = 'scene-background'
    this.sceneBackground.background = new Color(0x000000);

    this.selector = new Selector(this);

    this._needsUpdate = false;
  }

  get needsUpdate() {
    return this._needsUpdate;
  }

  set needsUpdate(value:boolean) {
    this._needsUpdate = value;
    if(!!value){
      this.signals.sceneGraphChanged.dispatch()
    }
  }

  addObject(object:Object3D, parent:Object3D| null, index:number |null) {

    if (parent === null) {
      this.scene.add(object);
    } else {
      if (index === null) {
        parent.add(object);
      } else {
        parent.children.splice(index, 0, object);
      }
      object.parent = parent;
    }

    this.signals.objectsAdded.dispatch(object);
    this.signals.sceneGraphChanged.dispatch();
    this.dispatchEvent('objectAdded', object);
  }

  removeObject(object:Object3D) {
    // 排除场景和视图相机
    if (object.parent === null) return;

    object.parent.remove(object);

    this.signals.objectsRemoved.dispatch(object);
    this.signals.sceneGraphChanged.dispatch();
  }

  removeObjectByUuid(uuid:string) {
    const object = this.getObjectByUuid(uuid);
    object && this.removeObject(object);
  }

  getObjectByUuid(uuid:string) {
    return this.scene.getObjectByProperty('uuid', uuid)
  }

  getObjectsByProperty(key:string, value:any) {
    let result = this.scene.getObjectsByProperty(key, value);
    const sceneHelperResult = this.sceneHelper.getObjectsByProperty(key, value);
    if (sceneHelperResult.length > 0) {
      result = result.concat(sceneHelperResult);
    }

    return result;
  }

  addHelper(helper:Object3D){
    this.sceneHelper.add(helper)
  }



  setState(key:string, value:any) {
    this.state[key] = value;
  }

  getState(key:string) {
    return this.state[key];
  }

  select(object:Object3D[]) {
    if (object.length) {
        this.selector.select(object.map((obj) => obj.uuid));
    } else {
      this.selector.detach();
    }
  }

  selectByIds(uuids:Array<string> | undefined) {
    if (uuids !== undefined) {
        this.selector.select(uuids);
    } else {
      this.selector.detach();
    }
  }

  setSceneBackground(background:Color|Texture|null) {
    this.sceneBackground.background = background;
    this.signals.sceneGraphChanged.dispatch();
  }
}

export { Editor };
