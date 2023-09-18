import { type Object3D, type OrthographicCamera, type PerspectiveCamera } from "three";
import { ViewPort } from "./ViewPort";
import type { Editor } from "./Editor";
import { OptionMode } from '../../types/coreTypes';
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
    setOptionMode(mode: OptionMode): void;
}
export { MainViewPort };
