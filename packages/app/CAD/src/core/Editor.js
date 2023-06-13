/*
 * @Date: 2023-06-12 23:25:01
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 01:19:29
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/Editor.js
 */

import { Container } from "./Container";

class Editor {
  constructor() {
    this.state = {};
    this.container = new Container();
  }

  addObject(object) {
    this.container.conllect(object);
    this.container.add(object);
  }
  removeObject(object) {
    this.container.discard(object);
    this.container.remove(object);
  }
  getObjectById() {}
}

export { Editor };
