import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { Editor } from "../../core/src/Editor";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
declare class TransformControlHandler {
    private transformControl;
    private objectPositionOnDown;
    private objectRotationOnDown;
    private objectScaleOnDown;
    private editor;
    constructor(transformControl: TransformControls, editor: Editor);
    handleChange(): void;
    handleMouseDown(orbitControls: OrbitControls): void;
    handleMouseUp(orbitControls: OrbitControls): void;
}
export { TransformControlHandler };
