/*
 * @Date: 2023-06-14 10:44:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-13 20:31:58
 * @FilePath: /threejs-demo/packages/f-engine/src/core/src/ViewPort.ts
 */
import { WebGLRenderer, type OrthographicCamera, type PerspectiveCamera, Vector2 } from 'three'
import { generateUUID } from 'three/src/math/MathUtils';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EventDispatcher } from '@f/utils';
import type { Editor } from './Editor';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

class ViewPort extends EventDispatcher {
  readonly uuid: string;
  protected type: string;
  protected editor: Editor;
  protected domElement: HTMLElement;
  protected renderer: WebGLRenderer;
  protected camera: OrthographicCamera | PerspectiveCamera;
  protected size: Vector2;
  public orbitControls: OrbitControls;
  public name: string;
  public onAfterRender: Function;
  public onBeforeRender: Function;
  protected composer: EffectComposer;

  constructor(editor: Editor, camera: OrthographicCamera | PerspectiveCamera, domElement: HTMLElement) {
    super();
    this.editor = editor;
    this.camera = camera;
    this.uuid = generateUUID();
    this.size = new Vector2();
    this.name = '';
    this.type = 'ViewPort';
    this.onAfterRender = () => { };
    this.onBeforeRender = () => { };

    this.renderer = new WebGLRenderer({ antialias: true ,logarithmicDepthBuffer:true});
    this.renderer.setClearColor(0xefefef);
    this.renderer.autoClear = false;

    this.domElement = document.createElement('div');
    this.domElement.style.position = 'absolute';
    this.domElement.setAttribute('id', 'F-ViewPort');
    this.domElement.appendChild(this.renderer.domElement);
    domElement.append(this.domElement)

    const { sceneBackground, scene, sceneHelper } = this.editor

    const bgRenderPass = new RenderPass(sceneBackground, this.camera);
    bgRenderPass.clear = false;

    const mainRenderPass = new RenderPass(scene, this.camera);
    mainRenderPass.clear = false;

    const helperRenderPass = new RenderPass(sceneHelper, this.camera);
    helperRenderPass.clear = false;

    const copyPass = new ShaderPass(CopyShader);

    const fxaaPass = new ShaderPass(FXAAShader);

    this.composer = new EffectComposer(this.renderer);
    
    this.composer.addPass(bgRenderPass);
    this.composer.addPass(mainRenderPass);
    this.composer.addPass(helperRenderPass);

    this.composer.addPass(fxaaPass);
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
    this.composer.render()
    this.onAfterRender(this.editor, this.camera);
  }

  public setSize(width: number, height: number) {
    this.size.set(width,height)
    this.renderer.setSize(width,height)
    this.composer.setSize(width, height);
    (this.composer.passes.at(-2) as ShaderPass).uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );

    if ((this.camera as OrthographicCamera)?.isOrthographicCamera) {
      (this.camera as OrthographicCamera).top = 15 * (height / width);
      (this.camera as OrthographicCamera).bottom = -15 * (height / width);
    } else if ((this.camera as PerspectiveCamera)?.isPerspectiveCamera) {
      (this.camera as PerspectiveCamera).aspect = width / height;
    }

    this.camera.updateProjectionMatrix();
    this.render();
  }
}

export { ViewPort };