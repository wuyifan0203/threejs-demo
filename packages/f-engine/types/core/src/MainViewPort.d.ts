import { type Object3D, type OrthographicCamera, type PerspectiveCamera } from "three";
import { ViewPort } from "./ViewPort";
import type { Editor } from "./Editor";
type Mode = 'select' | 'translate' | 'rotate' | 'scale';
declare class MainViewPort extends ViewPort {
    excludeObjects: Array<Object3D>;
    excludeTypes: Array<string>;
    private transformControl;
    private viewHelper;
    private statePanel;
    private clock;
    private needsUpdate;
    private _currentMode;
    constructor(editor: Editor, camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement);
    get currentMode(): string;
    protected render(): void;
    private animate;
    changeMode(mode: Mode): void;
}
export { MainViewPort };
