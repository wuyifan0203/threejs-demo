import { WebGLRenderer, OrthographicCamera, PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EventDispatcher } from '@f/utils';
import type { Editor } from './Editor';
declare class ViewPort extends EventDispatcher {
    readonly uuid: string;
    protected type: string;
    protected editor: Editor;
    protected domElement: HTMLElement;
    protected renderer: WebGLRenderer;
    protected camera: OrthographicCamera | PerspectiveCamera;
    protected width: number;
    protected height: number;
    orbitControls: OrbitControls;
    name: string;
    onAfterRenderScene: Function;
    onBeforeRender: Function;
    onBeforeRenderSceneHelper: Function;
    constructor(editor: Editor, camera: OrthographicCamera | PerspectiveCamera, domElement: HTMLElement);
    protected render(): void;
    setSize(width: number, height: number): void;
    getSize(): {
        width: number;
        height: number;
    };
}
export { ViewPort };
