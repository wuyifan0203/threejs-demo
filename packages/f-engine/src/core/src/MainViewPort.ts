/*
 * @Date: 2023-08-09 00:36:11
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-31 01:22:32
 * @FilePath: /threejs-demo/packages/f-engine/src/core/src/MainViewPort.ts
 */
import { type Object3D, type OrthographicCamera, type PerspectiveCamera, Clock, Vector2, Raycaster, Color, Mesh } from "three";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import StatsPanel from 'three/examples/jsm/libs/stats.module';
import { ViewPort } from "./ViewPort";
import type { Editor } from "./Editor";
import { ViewHelper } from "@/helper";
import { TransformControlHandler } from "./TransformControlHandler";
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';


type uuids = Array<string>;
type Mode = 'select'| 'translate'| 'rotate'|  'scale'


const _raycaster = new Raycaster();
const _mouse = new Vector2();

const _onDownPosition = new Vector2();
const _onUpPosition = new Vector2();

class MainViewPort extends ViewPort {
  public excludeObjects: Array<Object3D>;
  public excludeTypes: Array<string>;
  private transformControl: TransformControls;
  private viewHelper: ViewHelper;
  private statePanel: StatsPanel;
  private clock: Clock;
  private needsUpdate: boolean
  private _currentMode: string;

  constructor(editor: Editor, camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement) {
    super(editor, camera, domElement);
    this.type = 'MainViewPort';
    this.clock = new Clock();
    this.needsUpdate = false;

    this.renderer.setAnimationLoop(() => this.animate());

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

    const handler = new TransformControlHandler(this.transformControl);

    this.transformControl.addEventListener('change', () => handler.handleChange(editor))
    this.transformControl.addEventListener('mouseDown', () => handler.handleMouseDown(this))
    this.transformControl.addEventListener('mouseUp', () => handler.handleMouseUp(this))

    const outlinePass = new OutlinePass(this.size,this.editor.scene,this.camera);
    outlinePass.hiddenEdgeColor = outlinePass.visibleEdgeColor = new Color('#e29240');
    outlinePass.edgeStrength = 4;
    this.composer.insertPass(outlinePass,3);

    this._currentMode = 'select';


    
    const selectId: uuids = [];

    this.editor.signals.objectsRemoved.add((uuids: uuids) => {
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

    this.editor.signals.objectsSelected.add((uuids: uuids) => {
      selectObjects.length = 0;

      uuids.forEach(uuid => {
        const obj = this.editor.getObjectByUuid(uuid)
        obj && selectObjects.push(obj)
      })

      if (selectObjects.length !== 0) {
       
      
        
      }
       // 选择物体高亮
      (this.composer.passes[3] as OutlinePass).selectedObjects = selectObjects as Mesh[]
      this.editor.signals.sceneGraphChanged.dispatch()
    })

    const getIntersects = (point: Vector2) => {
      _mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
      _raycaster.setFromCamera(_mouse, camera);

      // 筛选需要检测的对象
      const objects: Object3D[] = [];

      // 排除的物体的id数组
      // 排除掉transformControl 和 selectionBox 和 extrudeObjects 和 不可见的
      const excludeUuids = [
        this.transformControl.uuid,
        ...this.excludeObjects.map((o) => o.uuid),
      ];

      for (let i = 0, l = editor.scene.children.length; i < l; i++) {
        traverseObject(editor.scene.children[i], excludeUuids, this.excludeTypes, objects);
      }

      for (let i = 0, l = editor.sceneHelper.children.length; i < l; i++) {
        traverseObject(editor.sceneHelper.children[i], excludeUuids, this.excludeTypes, objects);
      }


      return _raycaster.intersectObjects(objects, false);
    }


    const mutiSelectId: Array<string> = [];

    const handelClick = (event: PointerEvent) => {
      if (_onDownPosition.distanceTo(_onUpPosition) === 0) {
        const intersects = getIntersects(_onUpPosition);

        const intersectsObjectsUUId = intersects
          .map((item: { object: { uuid: any; }; }) => item?.object?.uuid)
          .filter((id: undefined) => id !== undefined);

        if (intersectsObjectsUUId.length === 0) {
          mutiSelectId.length = 0;
        } else {
          mutiSelectId.push(intersectsObjectsUUId[0]);
        }

        this.editor.signals.intersectionsDetected.dispatch(mutiSelectId);

        // 非多选模式需要清空，为下次单选做准备
        if (!event.ctrlKey) {
          mutiSelectId.length = 0;
        }
      }
    }

    const onMouseUp = (event: PointerEvent) => {
      const mousePosition = getMousePosition(event.clientX, event.clientY, this.renderer.domElement);
      _onUpPosition.fromArray(mousePosition);

      handelClick(event);

      this.renderer.domElement.removeEventListener('pointerup', onMouseUp);
    }

    const onMouseDown = (event: PointerEvent) => {
      // 鼠标左键点击则执行
      if (event.button !== 0) return;
      const mousePosition = getMousePosition(event.clientX, event.clientY, this.renderer.domElement);
      _onDownPosition.fromArray(mousePosition);

      this.renderer.domElement.addEventListener('pointerup', onMouseUp);
    }

    this.renderer.domElement.addEventListener('pointerdown', onMouseDown);
  }

  get currentMode(){
    return this._currentMode;
  }

  protected render(): void {
    super.render();

    this.viewHelper.render(this.renderer);

    this.needsUpdate = false;
  }

  private animate() {
    const delta = this.clock.getDelta();
    this.statePanel.update();
    if (this.viewHelper.animating === true) {
      this.viewHelper.update(delta);
      this.needsUpdate = true;
    }

    if (this.needsUpdate) {
      this.render()
    }
  }

  public changeMode(mode:Mode) {
    this._currentMode = mode;
    if(mode!=='select'){
      this.transformControl.setMode(mode);
    }
  }
}

function getMousePosition(x: number, y: number, dom: HTMLElement): [number, number] {
  const { left, top, width, height } = dom.getBoundingClientRect();
  return [(x - left) / width, (y - top) / height];
}

function traverseObject(object: Object3D, extrudeIds: uuids, type: Array<string>, target: Object3D[]) {
  if (!extrudeIds.includes(object.uuid) && object.visible && !type.includes(object.type)) {
    target.push(object);
  }
}


export { MainViewPort }