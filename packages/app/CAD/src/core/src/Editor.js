/*
 * @Date: 2023-06-12 23:25:01
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-14 00:24:22
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Editor.js
 */

import { Scene, WebGLRenderer } from "three";
import { Container } from "./Container";
import { DEFAULT_PERSPECTIVE_CAMERA } from "../../config/default";
import { ViewHelper } from "../../helper";

class Editor {
  constructor(target) {
    this.state = {};
    this.target = target;
    this.container = new Container();
    this.scene = new Scene();
    this.camera = DEFAULT_PERSPECTIVE_CAMERA.clone();
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.autoClear = false;
    this.viewHelper = new ViewHelper(this.camera, target);

    target.append(this.renderer.domElement)
  }

  render() {
    this.renderer.clear();
    this.viewHelper.render(this.renderer);
    this.renderer.render(this.scene, this.camera);
  }

  addObject(object) {
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
