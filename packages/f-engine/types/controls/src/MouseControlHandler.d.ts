import type { Editor, MainViewPort } from '../../core';
declare class MouseControlHandler {
    private domElement;
    private _mouse;
    private _onDownPosition;
    private _onUpPosition;
    private editor;
    private multiSelectId;
    private _raycaster;
    private viewPort;
    private transformControls;
    constructor(mainViewPort: MainViewPort, editor: Editor);
    handleMouseDown(event: PointerEvent): void;
    private handleMouseUp;
    private handelClick;
    private getIntersects;
}
export { MouseControlHandler };
