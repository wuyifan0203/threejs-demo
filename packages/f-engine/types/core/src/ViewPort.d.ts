import { WebGLRenderer, OrthographicCamera, PerspectiveCamera, Vector2 } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
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
    protected size: Vector2;
    orbitControls: OrbitControls;
    name: string;
    onAfterRender: Function;
    onBeforeRender: Function;
    protected composer: EffectComposer;
    constructor(editor: Editor, camera: OrthographicCamera | PerspectiveCamera, domElement: HTMLElement);
    protected render(): void;
    setSize(width: number, height: number): void;
}
export { ViewPort };