/*
 * @Date: 2023-08-11 00:42:23
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-21 13:24:00
 * @FilePath: /threejs-demo/packages/f-engine/src/controls/src/TransformControlHandler.ts
 */
import { Quaternion, Vector3 } from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { Editor } from "../../core/src/Editor";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MainViewPort } from "@/core";


class TransformControlHandler {
    private transformControl: TransformControls;
    private objectPositionOnDown: Vector3;
    private objectRotationOnDown: Quaternion;
    private objectScaleOnDown: Vector3;
    private editor: Editor;
    private orbitControls: OrbitControls;
  
    constructor(mainViewPort: MainViewPort,editor:Editor) {
      this.transformControl = mainViewPort.getTransformControls();
      this.orbitControls = mainViewPort.orbitControls;
      this.objectPositionOnDown = new Vector3();
      this.objectRotationOnDown = new Quaternion();
      this.objectScaleOnDown = new Vector3();
      this.editor = editor;
    }

    public handleChange(){
        const { object } = this.transformControl;

        if (object !== undefined) {
            this.editor.signals.sceneGraphChanged.dispatch();
        }
    }

    public handleMouseDown() {
        const { object } = this.transformControl;

        if (object !== undefined) {
            this.objectPositionOnDown.copy(object.position);
            this.objectRotationOnDown.copy(object.quaternion);
            this.objectScaleOnDown.copy(object.scale);

            this.orbitControls.enabled = false;
        }
    }

    public handleMouseUp(){
        const { object } = this.transformControl;

        if (object !== undefined) {
            switch (this.transformControl.getMode()) {
                case 'translate':
                    if (!this.objectPositionOnDown.equals(object.position)) {
                        this.editor.dispatchEvent('objectTranslate',object,this.objectPositionOnDown,object.position);
                    }
                    break;
                case 'rotate':
                    if (!this.objectRotationOnDown.equals(object.quaternion)) {
                        this.editor.dispatchEvent('objectRotate',object,this.objectRotationOnDown,object.quaternion);
                    }
                    break;
                case 'scale':
                    if (!this.objectScaleOnDown.equals(object.scale)) {
                        this.editor.dispatchEvent('objectScale',object,this.objectScaleOnDown,object.scale);
                    }
                    break;
                // skip default
            }
            this.orbitControls.enabled = true;
        }
    }
  }

  export {TransformControlHandler}