/*
 * @Date: 2023-06-14 10:44:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-29 20:31:42
 * @FilePath: /threejs-demo/packages/f-engine/src/core/src/ViewPort.ts
 */
import { WebGLRenderer, OrthographicCamera, PerspectiveCamera } from 'three'
import { generateUUID } from 'three/src/math/MathUtils';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EventDispatcher } from '@f/utils';
import type { Editor } from './Editor';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { ClearMaskPass, MaskPass } from 'three/examples/jsm/postprocessing/MaskPass';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader';

class ViewPort extends EventDispatcher {
  readonly uuid: string;
  protected type: string;
  protected editor: Editor;
  protected domElement: HTMLElement;
  protected renderer: WebGLRenderer;
  protected camera: OrthographicCamera | PerspectiveCamera;
  protected width: number;
  protected height: number;
  public orbitControls: OrbitControls;
  public name: string;
  public onAfterRenderScene: Function;
  public onBeforeRender: Function;
  public onBeforeRenderScene: Function;
  public onBeforeRenderSceneHelper: Function;
  protected composer: EffectComposer;

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
    this.onBeforeRenderScene = () => { };
    this.onBeforeRenderSceneHelper = () => { };

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xefefef);
    this.renderer.autoClear = false;

    const { sceneBackground, scene, sceneHelper } = this.editor

    const bgRenderPass = new RenderPass(sceneBackground, this.camera);
    bgRenderPass.clear = false;

    const mainRenderPass = new RenderPass(scene, this.camera);
    mainRenderPass.clear = false;

    const helperRenderPass = new RenderPass(sceneHelper, this.camera);
    helperRenderPass.clear = false;

    const bgMask = new MaskPass(sceneBackground, this.camera);
    const mainMask = new MaskPass(scene, this.camera);
    const helperMask = new MaskPass(sceneHelper, this.camera);

    const clearMaskPass = new ClearMaskPass();
    const copyPass = new ShaderPass(CopyShader);
    const gammaPass = new ShaderPass(GammaCorrectionShader);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(bgRenderPass);
    this.composer.addPass(mainRenderPass);
    this.composer.addPass(helperRenderPass);

    this.composer.addPass(bgMask);
    this.composer.addPass(clearMaskPass)
    this.composer.addPass(mainMask);
    this.composer.addPass(clearMaskPass)
    this.composer.addPass(helperMask);
    this.composer.addPass(clearMaskPass)
    this.composer.addPass(copyPass);


    this.orbitControls = new OrbitControls(camera, this.renderer.domElement);
    this.orbitControls.addEventListener('change', () => this.render());

    this.domElement.append(this.renderer.domElement);

    // signals
    this.editor.signals.sceneGraphChanged.add(() => this.render());
  }

  protected render() {
    this.renderer.clear();

    this.onBeforeRender(this.editor, this.camera);

    // this.renderer.render(this.editor.sceneBackground, this.camera)

    // this.onBeforeRenderScene(this.editor, this.camera);
    // this.renderer.render(this.editor.scene, this.camera);
    this.composer.render()

    // this.onBeforeRenderSceneHelper(this.editor, this.camera);

    // this.renderer.render(this.editor.sceneHelper, this.camera);

    this.onAfterRenderScene(this.editor, this.camera);
  }

  public setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width,height)
    this.composer.setSize(width, height);

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
