/*
 * @Date: 2023-06-12 23:25:01
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 18:22:26
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Editor.js
 */

import { Scene } from "three";
import { Container } from "./Container";
import { Player } from "./Player";
import { TransformControls } from "../../controls/TransformControls";

class Editor {
  constructor(target) {
    this.state = {};
    this.target = target
    this.container = new Container();
    this.scene = new Scene();
    this.player = new Player(this);
    this.control = new TransformControls(this.player.camera,target)
    target.append(this.player.renderer.domElement)
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
    this.container.findById(id)
  }

  setSize(width,height){
    this.player.setSize(width,height)
  }
}

export { Editor };
