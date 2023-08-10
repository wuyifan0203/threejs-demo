import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { Editor } from "./Editor";
import { MainViewPort } from "./MainViewPort";
declare class TransformControlHandler {
    private transformControl;
    private objectPositionOnDown;
    private objectRotationOnDown;
    private objectScaleOnDown;
    constructor(transformControl: TransformControls);
    handleChange(editor: Editor): void;
    handleMouseDown(viewPort: MainViewPort): void;
    handleMouseUp(viewPort: MainViewPort): void;
}
export { TransformControlHandler };
