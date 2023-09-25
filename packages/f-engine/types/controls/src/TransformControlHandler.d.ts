import { Editor } from "../../core/src/Editor";
import { MainViewPort } from '../../core';
declare class TransformControlHandler {
    private transformControl;
    private objectPositionOnDown;
    private objectRotationOnDown;
    private objectScaleOnDown;
    private editor;
    private orbitControls;
    constructor(mainViewPort: MainViewPort, editor: Editor);
    handleChange(): void;
    handleMouseDown(): void;
    handleMouseUp(): void;
}
export { TransformControlHandler };
