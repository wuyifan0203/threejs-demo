/*
 * @Date: 2023-06-13 17:10:39
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 18:17:48
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Player.js
 */

import { WebGLRenderer } from "three";
import { DEFAULT_PERSPECTIVE_CAMERA } from "../../config/default";

class Player {
  constructor(editor) {
    this.renderer = new WebGLRenderer({ antialias: true });
    this.camera = DEFAULT_PERSPECTIVE_CAMERA;
    this._editor = editor;
  }

  play() {
    this.renderer.render(this._editor.scene,this.camera);
  }

  setSize(width, height) {
    this.renderer.setSize(width, height);
  }
}

export { Player };
