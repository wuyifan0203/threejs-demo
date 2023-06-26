/*
 * @Date: 2023-06-14 10:44:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-26 16:57:47
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/ViewPort.js
 */

import { Box3Helper, Raycaster, GridHelper, Vector2, Box3, Clock } from "three";
import { initRenderer } from "../../lib/initialization";
import { ViewHelper } from "../../helper";
import { EditorControls, TransformControls } from "../../controls";
import { print, printDebugger, printInfo } from "../../utils/log";

class ViewPort {
  constructor(editor) {
    const signals = editor.signals;

    const renderer = initRenderer();
    renderer.setAnimationLoop(animate);

    const camera = editor.camera;
    const scene = editor.scene;
    const sceneHelper = editor.sceneHelper;
    const target = editor.target;

    target.append(renderer.domElement);

    const gridHelper = new GridHelper(50, 50, 0x888888);
    gridHelper.isHelper = true;

    const transformControls = new TransformControls(camera, target);
    transformControls.addEventListener("change", onTransformControlsChange);
    transformControls.addEventListener(
      "mouseDown",
      onTransformControlsMouseDown
    );
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

    let startTime, endTime;

    // main

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

    // TransformControls

    let objectPositionOnDown = null;
    let objectRotationOnDown = null;
    let objectScaleOnDown = null;

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

    // Selection

    const raycaster = new Raycaster();
    const mouse = new Vector2();

    function getIntersects(point) {
      mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
      raycaster.setFromCamera(mouse, camera);

      // 筛选需要检测的对象
      const objects = [];

      scene.traverseVisible((child) => {
        objects.push(child);
      });

      sceneHelper.traverseVisible((child) => {
        // if ( child.name === 'picker' ) objects.push( child );
      });

      return raycaster.intersectObjects(objects, false);
    }

    // Mouse

    const onDownPosition = new Vector2();
    const onUpPosition = new Vector2();
    const onDoubleClickPosition = new Vector2();

    function getMousePosition(x, y) {
      const { left, top, width, height } = target.getBoundingClientRect();
      return [(x - left) / width, (y - top) / height];
    }

    function onMouseDown(event) {
      const mousePosition = getMousePosition(event.clientX, event.clientY);
      onDownPosition.fromArray(mousePosition);

      target.addEventListener("mouseup", onMouseUp);
    }

    function onMouseUp(event) {
      const mousePosition = getMousePosition(event.clientX, event.clientY);
      onUpPosition.fromArray(mousePosition);

      handelClick();

      target.removeEventListener("mouseup", onMouseUp);
    }

    function handelClick() {
      if (onUpPosition.distanceTo(onDownPosition) === 0) {
        const intersects = getIntersects(onUpPosition);

        signals.intersectionsDetected.dispatch(intersects.map((obj) => obj.id));

        onRender();
      }
    }

    function onDoubleClick(event) {
      const mousePosition = getMousePosition(event.clientX, event.clientY);
      onDoubleClickPosition.fromArray(mousePosition);

      const intersects = getIntersects(onDoubleClickPosition);
      if(intersects.length > 0){

        const intersect = intersects[0];
        // TODO 物体聚焦
        // signals.objectFocused.dispatch( intersect.object );
      }
    }

    target.addEventListener('mousedown', onMouseDown)
    target.addEventListener('dblclick', onDoubleClick)

    // Animate

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

    // signals

    signals.windowResize.add(() => {
      printInfo("editor resized");
      onResize();
      onRender();
    });

    signals.windowResize.dispatch();

    signals.objectSelected.add((selectIds)=>{
      transformControls.detach();
      selectionBox.visible = false;

      const object = editor.getObjectById(selectIds[0]);

      if(object !== null && object !== scene && object !== camera){
        box.setFromObject(object,true);
        
        if(box.isEmpty() === false){
          selectionBox.visible = true;
        }

        transformControls.attach(object)
      }
    })
  }
}

export { ViewPort };
