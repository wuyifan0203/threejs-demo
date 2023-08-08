/*
 * @Date: 2023-06-14 10:44:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-08 20:53:52
 * @FilePath: /threejs-demo/packages/f-engine/src/core/src/ViewPort.ts
 */

import { Camera, OrthographicCamera, PerspectiveCamera, WebGLRenderer } from 'three';
import { generateUUID } from 'three/src/math/MathUtils';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EventDispatcher } from '@f/utils';
import { Editor } from './Editor';

class ViewPort extends EventDispatcher {
  readonly type: string;
  readonly uuid: string;
  protected editor: Editor;
  private camera: OrthographicCamera | PerspectiveCamera;
  protected domElement: HTMLElement;
  private width: number;
  private height: number;
  private renderer: WebGLRenderer;
  private orbitControls: OrbitControls;
  public name: string;
  public onAfterRenderScene: Function;
  public onBeforeRender: Function;
  public onBeforeRenderSceneHelper: Function;

  constructor(editor: Editor, camera: OrthographicCamera | PerspectiveCamera, domElement: HTMLElement) {
    super();
    this.editor = editor;
    this.camera = camera;
    this.domElement = domElement;
    this.uuid = generateUUID();
    this.width = 0;
    this.height = 0;
    this.name = '';
    this.type = 'ViewPort';
    this.onAfterRenderScene = () => { };
    this.onBeforeRender = () => { };
    this.onBeforeRenderSceneHelper = () => { };

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xefefef);
    this.renderer.autoClear = false;


    this.orbitControls = new OrbitControls(camera, this.renderer.domElement);
    this.orbitControls.addEventListener('change', () => {
      this.render();
    });

    this.domElement.append(this.renderer.domElement);

    // signals
    this.editor.signals.sceneGraphChanged.add(() => {
      this.render();
    });
  }

  private render() {
    this.onBeforeRender(this.editor, this.camera);
    
    this.renderer.clear();
    this.renderer.render(this.editor.scene, this.camera);

    this.onBeforeRenderSceneHelper(this.editor, this.camera);

    this.renderer.render(this.editor.sceneHelper, this.camera);

    this.onAfterRenderScene(this.editor, this.camera);
  }

  public setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);

    if (this.camera instanceof OrthographicCamera) {
      this.camera.top = 15 * (height / width);
      this.camera.bottom = -15 * (height / width);
    } else if (this.camera instanceof PerspectiveCamera) {
      this.camera.aspect = width / height;
    }

    this.camera.updateProjectionMatrix();
    this.render();
  }

  public getSize() {
    return {
      width: this.width,
      height: this.height,
    }
  }
}

export { ViewPort };
