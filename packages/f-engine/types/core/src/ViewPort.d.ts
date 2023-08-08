import { OrthographicCamera, PerspectiveCamera } from 'three';
import { EventDispatcher } from '@f/utils';
import { Editor } from './Editor';
declare class ViewPort extends EventDispatcher {
    readonly type: string;
    readonly uuid: string;
    protected editor: Editor;
    private camera;
    protected domElement: HTMLElement;
    private width;
    private height;
    private renderer;
    private orbitControls;
    name: string;
    onAfterRenderScene: Function;
    onBeforeRender: Function;
    onBeforeRenderSceneHelper: Function;
    constructor(editor: Editor, camera: OrthographicCamera | PerspectiveCamera, domElement: HTMLElement);
    private render;
    setSize(width: number, height: number): void;
    getSize(): {
        width: number;
        height: number;
    };
}
export { ViewPort };
