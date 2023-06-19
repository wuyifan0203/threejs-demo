/*
 * @Date: 2023-06-14 10:44:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-19 17:50:23
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/ViewPort.js
 */

import { Box3Helper, Raycaster, GridHelper, Vector2, Box3, Clock } from "three";
import { initRenderer } from "../../lib/initialization";
import { ViewHelper } from "../../helper";
import { EditorControls, TransformControls } from "../../controls";

class ViewPort {
  constructor(editor) {
    const signal = editor.signal;
    const renderer = initRenderer();
    renderer.setAnimationLoop(animate);
    const camera = editor.camera;
    const scene = editor.scene;
    const sceneHelper = editor.sceneHelper;
    const target = editor.target;

    target.append(renderer.domElement);

    const gridHelper = new GridHelper(50, 50, 0x888888);
    gridHelper.isHelper = true;

    let objectPositionOnDown = null;
    let objectRotationOnDown = null;
    let objectScaleOnDown = null;

    const transformControls = new TransformControls(camera, target);
    transformControls.addEventListener("change", onTransformControlsChange);
    transformControls.addEventListener("mouseDown",onTransformControlsMouseDown);
    transformControls.addEventListener("mouseUp", onTransformControlsMouseUp);
    sceneHelper.add(transformControls);

    const controls = new EditorControls(camera, target);
    controls.addEventListener("change", () => onRender());

    const viewHelper = new ViewHelper(camera, target);
    viewHelper.controls = controls;

    const box = new Box3();
    const selectionBox = new Box3Helper(box);
    selectionBox.visible = false;
    selectionBox.material.transparent = true;
    selectionBox.material.depthTest = false;
    sceneHelper.add(selectionBox);

    const raycaster = new Raycaster();
    const mouse = new Vector2();

    let startTime, endTime;

    function onRender() {
      startTime = performance.now();

      renderer.render(scene, camera);
      renderer.autoClear = false;
      sceneHelper.add(gridHelper);
      renderer.render(sceneHelper, camera);
      sceneHelper.remove(gridHelper);
      viewHelper.render(renderer);
      renderer.autoClear = true;

      endTime = performance.now();
    }

    function onResize() {
      const { width, height } = target.getBoundingClientRect();

      renderer.setSize(width, height);

      if (camera.type === "OrthographicCamera") {
        camera.top = 15 * (height / width);
        camera.bottom = -15 * (height / width);
      } else if (camera.type === "PerspectiveCamera") {
        camera.aspect = width / height;
      }

      camera.updateProjectionMatrix();
    }

    function onTransformControlsChange() {
      const object = transformControls.object;

      if (object !== undefined) {
        box.setFromObject(object, true);
        onRender();
      }
    }

    function onTransformControlsMouseDown() {
      const object = transformControls.object;

      if (object !== undefined) {
        objectPositionOnDown = object.position.clone();
        objectRotationOnDown = object.rotation.clone();
        objectScaleOnDown = object.scale.clone();

        controls.enabled = false;
      }
    }

    function onTransformControlsMouseUp() {
      const object = transformControls.object;

      if (object !== undefined) {
        switch (transformControls.getMode) {
          case "translate":
            if (!objectPositionOnDown.equals(object.position)) {
              // TODO command
            }
            break;
          case "rotate":
            if (!objectRotationOnDown.equals(object.rotation)) {
              // TODO command
            }
            break;
          case "scale":
            if (!objectScaleOnDown.equals(object.scale)) {
              // TODO command
            }
            break;
        }
        controls.enabled = true;
      }
    }

    const clock = new Clock();

    function animate() {
      let needsUpdate = false;
      const delta = clock.getDelta();

      if (viewHelper.animating === true) {
        viewHelper.update(delta);
        needsUpdate = true;
      }

      if (needsUpdate === true) onRender();
    }

    onResize();
    onRender();
  }
}

export { ViewPort };
