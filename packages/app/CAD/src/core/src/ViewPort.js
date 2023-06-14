/*
 * @Date: 2023-06-14 10:44:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-14 16:50:32
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/ViewPort.js
 */

import { Clock, GridHelper } from "three";
import { initRenderer } from "../../lib/initialization";
import { ViewHelper } from "../../helper";
import { EditorControls } from "./EditorControls";

let startTime, endTime;

class ViewPort {
  constructor(editor) {
    const signal = editor.signal;

    const renderer = initRenderer();
    const camera = editor.camera;
    const scene = editor.scene;
    const sceneHelper = editor.sceneHelper;
    const target = editor.target;

    target.append(renderer.domElement)

    const gridHelper = new GridHelper(50, 50, 0x888888);
    gridHelper.isHelper = true;
    const viewHelper = new ViewHelper(camera, target);

    sceneHelper.add(gridHelper);

 

    const clock = new Clock();
    
    const controls = new EditorControls(camera,target)
    controls.addEventListener( 'change', function () {
        render()
	} );



    const render = () => {
      startTime = performance.now();

      renderer.render(scene, camera);
      renderer.autoClear = false;
      renderer.render(sceneHelper, camera);
      viewHelper.render(renderer);
      renderer.autoClear = true;
      endTime = performance.now();
    };

    const resize = () => {
      const { width, height } = target.getBoundingClientRect();
      renderer.setSize(width, height);

      if (camera.type === "OrthographicCamera") {
        camera.top = 15 * (height / width);
        camera.bottom = -15 * (height / width);
      } else if (camera.type === "PerspectiveCamera") {
        camera.aspect = width / height;
      }
      camera.updateProjectionMatrix();
    };


    resize();
    render()

  }
}

export { ViewPort };
