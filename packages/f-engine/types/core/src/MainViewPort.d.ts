import { type Object3D, type OrthographicCamera, type PerspectiveCamera } from "three";
import { ViewPort } from "./ViewPort";
import type { Editor } from "./Editor";
type transformMode = 'translate' | 'scale' | 'rotate';
declare class MainViewPort extends ViewPort {
    excludeObjects: Array<Object3D>;
    excludeTypes: Array<string>;
    private transformControl;
    private viewHelper;
    private statePanel;
    private clock;
    private needsUpdate;
    constructor(editor: Editor, camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement);
    protected render(): void;
    setTransformMode(mode: transformMode): void;
    private animate;
    setSize(width: number, height: number): void;
}
export { MainViewPort };
