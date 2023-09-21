/*
 * @Date: 2023-08-09 00:36:11
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-21 13:23:12
 * @FilePath: /threejs-demo/packages/f-engine/src/core/src/MainViewPort.ts
 */
import { type Object3D, type OrthographicCamera, type PerspectiveCamera, Clock, Vector2, Raycaster, Color, Mesh } from "three";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import StatsPanel from 'three/examples/jsm/libs/stats.module';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ViewPort } from "./ViewPort";
import type { Editor } from "./Editor";
import { ViewHelper } from "@/helper";
import { MouseControlHandler, TransformControlHandler } from "@/controls";
import { Uuids, OptionModeType } from '@/types'



const _transformControlsChangeEvent = 'change';
const _transformControlsMouseUpEvent = 'mouseUp';
const _transformControlsMouseDownEvent = 'mouseDown';

const _domMouseDownEvent = 'pointerdown';

class MainViewPort extends ViewPort {
  public excludeObjects: Array<Object3D>;
  public excludeTypes: Array<string>;
  private transformControl: TransformControls;
  private viewHelper: ViewHelper;
  private statePanel: StatsPanel;
  private _clock = new Clock();
  private needsUpdate = false;
  private _currentMode: OptionModeType = 'select';
  public animation!: (Clock: Clock) => void;
  private _raycaster = new Raycaster();

  constructor(editor: Editor, camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement) {
    super(editor, camera, domElement);
    this.type = 'MainViewPort';

    this.excludeObjects = [];
    this.excludeTypes = [];

    this.statePanel = new StatsPanel();
    this.statePanel.showPanel(0);
    this.statePanel.dom.style.position = 'absolute';
    this.statePanel.dom.style.zIndex = '1';

    this.domElement.setAttribute('id', 'F-MainViewPort');
    this.domElement.append(this.statePanel.dom);

    this.viewHelper = new ViewHelper(camera, this.domElement);

    this.transformControl = new TransformControls(camera, this.renderer.domElement);
    this.editor.addHelper(this.transformControl);

    this.animation = () => { };
    const transformControlHandler = new TransformControlHandler(this, editor);

    const outlinePass = new OutlinePass(this.size, this.editor.scene, this.camera);
    outlinePass.hiddenEdgeColor = outlinePass.visibleEdgeColor = new Color('#e29240');
    outlinePass.edgeStrength = 4;
    this.composer.insertPass(outlinePass, 3);

    const selectId: Uuids = [];

    this.editor.signals.objectsRemoved.add((uuids: Uuids) => {
      const selections: Set<string> = this.editor.getState('selections');

      const originSize = selections.size;
      uuids.forEach(uuid => selections.delete(uuid));

      if (originSize !== selections.size) {
        selectId.length = 0
        for (let i of selections.values()) {
          selectId.push(i)
        }
        this.editor.selectByIds(selectId)
      }
    });

    const selectObjects: Array<Object3D> = []

    this.editor.signals.objectsSelected.add((uuids: Uuids) => {
      selectObjects.length = 0;

      uuids.forEach(uuid => {
        const obj = this.editor.getObjectByUuid(uuid);
        obj && selectObjects.push(obj);
      });

      if (selectObjects.length === 1 && this._currentMode !== 'select') {
        this.transformControl.attach(selectObjects[0]);
      } else {
        this.transformControl.detach();
      }

      // 选择物体高亮
      (this.composer.passes[3] as OutlinePass).selectedObjects = selectObjects as Mesh[]
      this.editor.signals.sceneGraphChanged.dispatch()
    })
 
    this.eventBus.transformControlsMouseUp = () => transformControlHandler.handleMouseUp();
    this.eventBus.transformControlsMouseDown = () => transformControlHandler.handleMouseDown();
    this.eventBus.transformControlsChange = () => transformControlHandler.handleChange();

    const mouseHandler = new MouseControlHandler(this,this.editor)
    this.eventBus.domMouseDown = (e:PointerEvent) => mouseHandler.handleMouseDown(e);
  
  }

  protected mountEvents(): void {
    super.mountEvents();
    console.log('mountEvents');
    
    this.renderer.setAnimationLoop(this.animate.bind(this));
    this.transformControl.addEventListener(_transformControlsChangeEvent, this.eventBus.transformControlsChange)
    this.transformControl.addEventListener(_transformControlsMouseDownEvent, this.eventBus.transformControlsMouseDown)
    this.transformControl.addEventListener(_transformControlsMouseUpEvent, this.eventBus.transformControlsMouseUp)
    this.renderer.domElement.addEventListener(_domMouseDownEvent,this.eventBus.domMouseDown);
  }

  protected unmountEvents(): void {
    super.unmountEvents();
    this.renderer.setAnimationLoop(null);
    this.transformControl.removeEventListener(_transformControlsChangeEvent, this.eventBus.transformControlsChange)
    this.transformControl.removeEventListener(_transformControlsMouseDownEvent, this.eventBus.transformControlsMouseDown)
    this.transformControl.removeEventListener(_transformControlsMouseUpEvent, this.eventBus.transformControlsMouseUp)
    this.renderer.domElement.removeEventListener(_domMouseDownEvent,this.eventBus.domMouseDown);
  }

  get currentMode() {
    return this._currentMode;
  }

  protected render(): void {
    super.render();

    this.viewHelper.render(this.renderer);

    this.needsUpdate = false;
  }

  private animate() {
    const delta = this._clock.getDelta();
    
    this.statePanel.update();

    this.animation(this._clock)

    if (this.viewHelper.animating === true) {
      this.viewHelper.update(delta);
      this.needsUpdate = true;
    }

    if (this.needsUpdate) {
      this.render()
    }
  }

  public setOptionMode(mode: OptionModeType) {
    this._currentMode = mode;

    if (mode !== 'select') {
      this.transformControl.setMode(mode);

      const selections: Set<string> = this.editor.getState('selections');
      if (selections.size === 1) {
        const obj = this.editor.getObjectByUuid(selections.values().next().value);
        obj && this.transformControl.attach(obj);
      }
    } else {
      this.transformControl.detach();
    }
    this.editor.needsUpdate = true;
  }

  public getRaycaster() {
    return this._raycaster;
  }

  public getTransformControls() {
    return this.transformControl;
  }
}


export { MainViewPort }