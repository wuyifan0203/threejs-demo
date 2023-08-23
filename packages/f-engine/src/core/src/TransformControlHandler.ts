/*
 * @Date: 2023-08-11 00:42:23
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-24 01:09:32
 * @FilePath: /threejs-demo/packages/f-engine/src/core/src/TransformControlHandler.ts
 */
import { Euler, Vector3 } from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { Editor } from "./Editor";
import { MainViewPort } from "./MainViewPort";


class TransformControlHandler {
    private transformControl: TransformControls;
    private objectPositionOnDown: Vector3;
    private objectRotationOnDown: Euler;
    private objectScaleOnDown: Vector3;
  
    constructor(transformControl: TransformControls) {
      this.transformControl = transformControl;
      this.objectPositionOnDown = new Vector3();
      this.objectRotationOnDown = new Euler();
      this.objectScaleOnDown = new Vector3();
    }

    public handleChange(editor:Editor){
        const { object } = this.transformControl;

        if (object !== undefined) {
            editor.signals.sceneGraphChanged.dispatch();
        }
    }

    public handleMouseDown(viewPort:MainViewPort) {
        const { object } = this.transformControl;

        if (object !== undefined) {
            this.objectPositionOnDown.copy(object.position);
            this.objectRotationOnDown.copy(object.rotation);
            this.objectScaleOnDown.copy(object.scale);

           
            viewPort.orbitControls.enabled = false;
        }
    }

    public handleMouseUp(viewPort:MainViewPort){
        const { object } = this.transformControl;

        if (object !== undefined) {
            switch (this.transformControl.getMode()) {
                case 'translate':
                    if (!this.objectPositionOnDown.equals(object.position)) {
                        // TODO command
                    }
                    break;
                case 'rotate':
                    if (!this.objectRotationOnDown.equals(object.rotation)) {
                        // TODO command
                    }
                    break;
                case 'scale':
                    if (!this.objectScaleOnDown.equals(object.scale)) {
                        // TODO command
                    }
                    break;
                // skip default
            }
            viewPort.orbitControls.enabled = true;
        }
    }
  }

  export {TransformControlHandler}