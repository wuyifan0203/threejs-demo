import { type Object3D, type OrthographicCamera, type PerspectiveCamera, Clock, Raycaster } from "three";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { ViewPort } from "./ViewPort";
import type { Editor } from "./Editor";
import { OptionModeType } from '../../types';
declare class MainViewPort extends ViewPort {
    excludeObjects: Array<Object3D>;
    excludeTypes: Array<string>;
    private transformControl;
    private viewHelper;
    private statePanel;
    private _clock;
    private needsUpdate;
    private _currentMode;
    animation: (Clock: Clock) => void;
    private _raycaster;
    constructor(editor: Editor, camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement);
    protected mountEvents(): void;
    protected unmountEvents(): void;
    get currentMode(): OptionModeType;
    protected render(): void;
    private animate;
    setOptionMode(mode: OptionModeType): void;
    getRaycaster(): Raycaster;
    getTransformControls(): TransformControls;
}
export { MainViewPort };
