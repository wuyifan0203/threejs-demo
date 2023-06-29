/*
 * @Date: 2023-06-12 23:25:01
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-29 14:36:54
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Editor.js
 */

import { Container } from './Container';
import { Signal } from '../../lib/signals';
import { Selector } from './Selector';
import {
  initPerspectiveCamera,
  initScene,
  initOrthographicCamera,
} from '../../utils/initialization';

class Editor {
  constructor(target) {
    this.state = {
    };
    this.signals = {
      windowResize: new Signal(),
      objectSelected: new Signal(),
      intersectionsDetected: new Signal(),
      objectAdded: new Signal(),
      sceneGraphChanged: new Signal(),
      viewPortCameraChanged: new Signal(),
      sceneRendered: new Signal(),
    };
    this.target = target;
    this.container = new Container(this);
    this.scene = initScene();
    this.sceneHelper = initScene();

    this.cameras = {
      orthographic: initOrthographicCamera(),
      perspective: initPerspectiveCamera(),
    };
    this.viewPortCamera = this.cameras.orthographic;

    this.selector = new Selector(this);
    this.selected = [];
  }

  addObject(object, parent, index) {
    object.traverse((child) => {
      if (child.geometry !== undefined) this.addGeometry(child.geometry);
      if (child.material !== undefined) this.addMaterial(child.material);

      this.container.addObject(child);

      // TODO
      // addCamera
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

    this.signals.objectAdded.dispatch(object);
    this.signals.sceneGraphChanged.dispatch();
  }

  addCamera(camera) {
    this.container.addCamera(camera);
  }

  addGeometry(geometry) {
    this.container.addGeometry(geometry);
  }

  addMaterial(geometry) {
    this.container.addMaterial(geometry);
  }

  removeObject(object) {
    this.scene.remove(object);
  }

  getObjectByUUID(uuid, isGlobal = false) {
    return isGlobal
      ? this.scene.getObjectByProperty('uuid', uuid)
      : this.container.getObjectByUUID(uuid);
  }

  getObjectsByProperty(key, value) {
    let result = this.scene.getObjectsByProperty(key, value);
    const sceneHelperResult = this.sceneHelper.getObjectsByProperty(key, value);
    if (sceneHelperResult.length > 0) {
      result = result.concat(sceneHelperResult);
    }

    return result;
  }

  toggleViewportCamera() {
    const { orthographic, perspective } = this.cameras;

    if (orthographic === this.viewPortCamera) {
      this.viewPortCamera = perspective;
    } else {
      this.viewPortCamera = orthographic;
    }
    this.signals.viewPortCameraChanged.dispatch();

    this.signals.sceneGraphChanged.dispatch();
  }

  setState(key, value) {
    this.state[key] = value;
  }

  getState(key) {
    return this.state[key];
  }
}

export { Editor };
