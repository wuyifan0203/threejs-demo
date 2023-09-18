/*
 * @Date: 2023-08-11 00:42:23
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-18 17:43:18
 * @FilePath: /threejs-demo/packages/f-engine/src/controls/src/TransformControlHandler.ts
 */
import { Quaternion, Vector3 } from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { Editor } from "../../core/src/Editor";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


class TransformControlHandler {
    private transformControl: TransformControls;
    private objectPositionOnDown: Vector3;
    private objectRotationOnDown: Quaternion;
    private objectScaleOnDown: Vector3;
    private editor: Editor;
  
    constructor(transformControl: TransformControls,editor:Editor) {
      this.transformControl = transformControl;
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

    public handleMouseDown(orbitControls:OrbitControls) {
        const { object } = this.transformControl;

        if (object !== undefined) {
            this.objectPositionOnDown.copy(object.position);
            this.objectRotationOnDown.copy(object.quaternion);
            this.objectScaleOnDown.copy(object.scale);

           
            orbitControls.enabled = false;
        }
    }

    public handleMouseUp(orbitControls:OrbitControls){
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
            orbitControls.enabled = true;
        }
    }
  }

  export {TransformControlHandler}