/*
 * @Date: 2023-06-12 23:25:01
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-10 20:08:01
 * @FilePath: /threejs-demo/packages/f-engine/src/core/src/Editor.ts
 */

import { EventDispatcher } from '@f/utils';
import { Signal } from 'signals';
import { Selector } from './Selector';
import { SignalTypes,SignalsMap } from '../../types/SignalTypes';
import { Camera, Color, Mesh, Object3D, Scene, Texture } from 'three';

class Editor extends EventDispatcher {
  
  private state:{
    selections:Set<string>
    [key:string]:any
  };
  private selector:Selector
  public signals:SignalTypes<SignalsMap>;
  public domElement:HTMLElement;
  public scene:Scene;
  public sceneHelper:Scene

  constructor(domElement:HTMLElement) {
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
    this.domElement = domElement;
    this.scene = new Scene()
    this.sceneHelper = new Scene();

    this.selector = new Selector(this);
  }

  addObject(object:Object3D, parent:Object3D, index:number |undefined) {
    object.traverse((child) => {
      if (child.geometry !== undefined) this.addGeometry(child.geometry);
      if (child.material !== undefined) this.addMaterial(child.material);


      this.addCamera(object);
      // TODO
      // addHelper
    });

    if (parent === undefined) {
      this.scene.add(object);
    } else {
      if (index === undefined) {
        parent.add(object);
      } else {
        parent.children.slice(index, 0, object);
      }
      object.parent = parent;
    }

    this.signals.objectsAdded.dispatch(object);
    this.signals.sceneGraphChanged.dispatch();
    this.dispatchEvent('objectAdded', object);
  }

  addCamera(camera:Camera) {
    if (camera?.isCamera) {
    }
  }

  removeCamera(camera:) {
    if (camera?.isCamera) {
    }
  }

  addGeometry(geometry) {
  }

  removeGeometry(geometry) {
  }

  addMaterial(material) {
  }

  removeMaterial(material) {
  }

  removeObject(object) {
    // 排除场景和视图相机
    if (object.parent === null) return;
    object.traverse((child) => {
      if (child.geometry !== undefined) this.removeGeometry(child.geometry);
      if (child.material !== undefined) this.removeMaterial(child.material);

      this.removeCamera(child);

      // TODO
      // scope.removeHelper(child);
    });

    object.parent.remove(object);

    this.signals.objectRemoved.dispatch(object);
    this.signals.sceneGraphChanged.dispatch();
  }

  removeObjectByUuid(uuid) {
    const object = this.getObjectByUuid(uuid);
    object && this.removeObject(object);
  }

  getObjectByUuid(uuid:string) {
    return this.scene.getObjectByProperty('uuid', uuid)
  }

  getObjectsByProperty(key, value) {
    let result = this.scene.getObjectsByProperty(key, value);
    const sceneHelperResult = this.sceneHelper.getObjectsByProperty(key, value);
    if (sceneHelperResult.length > 0) {
      result = result.concat(sceneHelperResult);
    }

    return result;
  }

  addHelper(helper){
    this.sceneHelper.add(helper)
  }



  setState(key, value) {
    this.state[key] = value;
  }

  getState(key) {
    return this.state[key];
  }

  select(object) {
    if (object !== undefined) {
      if (Array.isArray(object)) {
        this.selector.select(object.map((obj) => obj?.uuid));
      } else {
        this.selector.select([object?.uuid]);
      }
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
    this.scene.background = background;
    this.signals.sceneGraphChanged.dispatch();
  }
}

export { Editor };
