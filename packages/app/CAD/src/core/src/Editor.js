/*
 * @Date: 2023-06-12 23:25:01
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-14 17:59:29
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Editor.js
 */

import { Container } from "./Container";
import { Signal } from "../../lib/signals";
import { initOrthographicCamera, initPerspectiveCamera, initScene } from "../../lib/initialization";

class Editor {
  constructor(target) {
    this.state = {};
    this.signals = {
      rendererCreate:new Signal()
    }
    this.target = target;
    this.container = new Container();
    this.scene = initScene();
    this.sceneHelper = initScene();
    this.camera = initPerspectiveCamera();
  }


  addObject(object,parent,index) {
    this.container.register(object);
    this.scene.add(object);
  }
  removeObject(object) {
    this.container.discard(object);
    this.scene.remove(object);
  }

  getObjectById(id) {
    this.container.findById(id);
  }

  setSize(width, height) {
    this.renderer.setSize(width, height);
  }
}

export { Editor };