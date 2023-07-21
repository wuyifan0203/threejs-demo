/*
 * @Date: 2023-06-14 10:44:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-06 09:58:23
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/ViewPort.js
 */

import {
  Box3Helper,
  Raycaster,
  GridHelper,
  Vector2,
  Box3,
  Clock,
} from 'three';
import { initRenderer } from '../../utils/initialization';
import { ViewHelper } from '../../helper';
import { TransformControls, OrbitControls } from '../../controls';
import { print, printInfo } from '../../utils/log';
import { Stats } from './Stats';

class ViewPort {
  constructor(editor) {
    const { signals } = editor;

    const renderer = initRenderer();
    renderer.setAnimationLoop(animate);

    const { scene } = editor;
    const { sceneHelper } = editor;
    const { target } = editor;

    target.append(renderer.domElement);

    const gridHelper = new GridHelper(50, 50, 0x888888);
    gridHelper.rotateX(Math.PI / 2);
    gridHelper.isHelper = true;

    const transformControls = new TransformControls(editor.viewPortCamera, target);
    transformControls.addEventListener('change', onTransformControlsChange);
    transformControls.addEventListener('mouseDown', onTransformControlsMouseDown);
    transformControls.addEventListener('mouseUp', onTransformControlsMouseUp);
    sceneHelper.add(transformControls);

    const orbitControls = new OrbitControls(editor.viewPortCamera, target);
    let needsUpdate = false;
    orbitControls.addEventListener('change', () => {
      needsUpdate = true;
    });

    const viewHelper = new ViewHelper(editor.viewPortCamera, target);

    const box = new Box3();
    const selectionBox = new Box3Helper(box);
    selectionBox.visible = false;
    selectionBox.material.transparent = true;
    selectionBox.material.depthTest = false;
    sceneHelper.add(selectionBox);

    this.stats = new Stats(editor);

    target.append(this.stats.domElement);

    // main
    let startTime; let
      endTime;
    function onRender() {
      console.count('onRender ->');
      startTime = performance.now();

      renderer.render(scene, editor.viewPortCamera);
      renderer.autoClear = false;
      sceneHelper.add(gridHelper);
      renderer.render(sceneHelper, editor.viewPortCamera);
      sceneHelper.remove(gridHelper);
      viewHelper.render(renderer);
      renderer.autoClear = true;
      needsUpdate = false;

      endTime = performance.now();

      signals.sceneRendered.dispatch(endTime - startTime);
    }

    function onResize() {
      const { width, height } = target.getBoundingClientRect();
      const camera = editor.viewPortCamera;
      renderer.setSize(width, height);

      if (camera.type === 'OrthographicCamera') {
        camera.top = 15 * (height / width);
        camera.bottom = -15 * (height / width);
      } else if (camera.type === 'PerspectiveCamera') {
        camera.aspect = width / height;
      }

      camera.updateProjectionMatrix();
    }

    // TransformControls

    let objectPositionOnDown = null;
    let objectRotationOnDown = null;
    let objectScaleOnDown = null;

    function onTransformControlsChange() {
      const { object } = transformControls;

      if (object !== undefined) {
        box.setFromObject(object, true);
        onRender();
      }
    }

    function onTransformControlsMouseDown() {
      const { object } = transformControls;

      if (object !== undefined) {
        objectPositionOnDown = object.position.clone();
        objectRotationOnDown = object.rotation.clone();
        objectScaleOnDown = object.scale.clone();

        orbitControls.enabled = false;
      }
    }

    function onTransformControlsMouseUp() {
      const { object } = transformControls;

      if (object !== undefined) {
        switch (transformControls.getMode) {
          case 'translate':
            if (!objectPositionOnDown.equals(object.position)) {
              // TODO command
            }
            break;
          case 'rotate':
            if (!objectRotationOnDown.equals(object.rotation)) {
              // TODO command
            }
            break;
          case 'scale':
            if (!objectScaleOnDown.equals(object.scale)) {
              // TODO command
            }
            break;
            // skip default
        }
        orbitControls.enabled = true;
      }
    }

    // Selection

    const raycaster = new Raycaster();
    const mouse = new Vector2();

    function getIntersects(point) {
      mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
      raycaster.setFromCamera(mouse, editor.viewPortCamera);

      // 筛选需要检测的对象
      const objects = [];

      scene.traverseVisible((child) => {
        objects.push(child);
      });

      for (let i = 0, l = sceneHelper.children.length; i < l; i++) {
        const child = sceneHelper.children[i];
        // 排除掉transformControl 和 selectionBox
        const enablePicked = child.uuid !== transformControls.uuid && child.uuid !== selectionBox.uuid && child.visible;
        if (enablePicked) {
          objects.push(sceneHelper.children[i]);
        }
      }

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

      target.addEventListener('mouseup', onMouseUp);
    }

    function onMouseUp(event) {
      const mousePosition = getMousePosition(event.clientX, event.clientY);
      onUpPosition.fromArray(mousePosition);

      handelClick();

      target.removeEventListener('mouseup', onMouseUp);
    }

    function handelClick() {
      if (onDownPosition.distanceTo(onUpPosition) === 0) {
        const intersects = getIntersects(onUpPosition);

        console.log(intersects, 'handelClick');

        const intersectsObjectsUUId = intersects.map((item) => item?.object?.uuid).filter((id) => id !== undefined);

        signals.intersectionsDetected.dispatch(intersectsObjectsUUId);
      }
    }

    function onDoubleClick(event) {
      const mousePosition = getMousePosition(event.clientX, event.clientY);
      onDoubleClickPosition.fromArray(mousePosition);

      const intersects = getIntersects(onDoubleClickPosition);
      if (intersects.length > 0) {
        // const intersect = intersects[0];
        // TODO 物体聚焦
        // signals.objectFocused.dispatch( intersect.object );
      }
    }

    target.addEventListener('mousedown', onMouseDown);
    target.addEventListener('dblclick', onDoubleClick);

    // Animate

    const clock = new Clock();

    function animate() {
      const delta = clock.getDelta();

      if (viewHelper.animating === true) {
        viewHelper.update(delta);
        needsUpdate = true;
      }

      if (needsUpdate === true) onRender();
    }

    // signals

    signals.windowResize.add(() => {
      printInfo('editor resized');
      onResize();
      onRender();
    });

    signals.windowResize.dispatch();

    signals.objectSelected.add((selectIds) => {
      transformControls.detach();
      selectionBox.visible = false;

      const object = editor.getObjectByUuid(selectIds[0]);
      print('signals.objectSelected->', object);

      if (object !== undefined && object !== scene && object !== editor.viewPortCamera) {
        box.setFromObject(object, true);

        if (box.isEmpty() === false) {
          selectionBox.visible = true;
        }

        transformControls.attach(object);
      }
      needsUpdate = true;
    });

    signals.objectRemoved.add((object) => {
      const index = editor.selected.findIndex((id) => id === object?.uuid);
      if (index !== -1) {
        editor.selectById(editor.selected.splice(index, 1));
      }
    });

    signals.sceneGraphChanged.add(() => {
      onRender();
    });

    signals.viewPortCameraChanged.add(() => {
      transformControls.camera = editor.viewPortCamera;
      orbitControls.object = editor.viewPortCamera;
      viewHelper.object = editor.viewPortCamera;

      editor.viewPortCamera.lookAt(orbitControls.target);

      onResize();
    });

    signals.transformModeChange.add((mode) => {
      transformControls.setMode(mode);
    });

    this.setTransformMode = function (mode) {
      signals.transformModeChange.dispatch(mode);
    };
  }
}

export { ViewPort };
