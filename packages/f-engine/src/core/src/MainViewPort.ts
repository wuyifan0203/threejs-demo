/*
 * @Date: 2023-08-09 00:36:11
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-21 01:10:29
 * @FilePath: /threejs-demo/packages/f-engine/src/core/src/MainViewPort.ts
 */
import { type Object3D, type OrthographicCamera, type PerspectiveCamera, Clock, Vector2, Raycaster, Color } from "three";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import StatsPanel from 'three/examples/jsm/libs/stats.module';
import { ViewPort } from "./ViewPort";
import type { Editor } from "./Editor";
import { ViewHelper } from "@/helper";
import { TransformControlHandler } from "./TransformControlHandler";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

type uuids = Array<string>;
type transformMode = 'translate' | 'scale' | 'rotate'


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
  //   public composer: EffectComposer;
  //   public outlinePass: OutlinePass;
  // effectFXAA: ShaderPass;
    constructor(editor: Editor, camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement) {
        super(editor, camera, domElement);
        this.type = 'MainViewPort';
        this.clock = new Clock();
        this.needsUpdate = false;

        this.renderer.setAnimationLoop(() => this.animate());

        // this.composer = new EffectComposer( this.renderer );

        // const renderPass = new RenderPass( this.editor.scene, this.camera );
				// this.composer.addPass( renderPass );

        // this.outlinePass = new OutlinePass( new Vector2(this.width, this.height), this.editor.scene, camera );
        // this.outlinePass.hiddenEdgeColor = new Color( 1, 0, 0 );
				// this.composer.addPass( this.outlinePass );

        // const outputPass = new OutputPass();
				// this.composer.addPass( outputPass );

        // this.effectFXAA = new ShaderPass( FXAAShader );
				// this.effectFXAA.uniforms[ 'resolution' ].value.set( 1 / this.width, 1 / this.height );
				// this.composer.addPass( this.effectFXAA );

        


        this.excludeObjects = [];
        this.excludeTypes = [];

        this.statePanel = new StatsPanel();
        this.statePanel.showPanel(0);
        this.statePanel.dom.style.position = 'absolute';
        this.statePanel.dom.style.zIndex = '1';

        console.log(this.statePanel.dom);
        
        domElement.append(this.statePanel.dom);

        this.viewHelper = new ViewHelper(camera, domElement);

        this.transformControl = new TransformControls(camera, this.renderer.domElement);
        this.editor.addHelper(this.transformControl);

        const handler = new TransformControlHandler(this.transformControl);

        this.transformControl.addEventListener('change', () => handler.handleChange(editor))
        this.transformControl.addEventListener('mouseDown', () => handler.handleMouseDown(this))
        this.transformControl.addEventListener('mouseUp', () => handler.handleMouseUp(this))

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
            this.transformControl.detach();
            selectObjects.length = 0;

            console.log(uuids);
            

            uuids.forEach(uuid => {
                const obj = this.editor.getObjectByUuid(uuid)
                obj && selectObjects.push(obj)
            })

            if (selectObjects.length !== 0) {
                if (selectObjects.length === 1) {
                    this.transformControl.attach(selectObjects[0])
                }

                console.log(selectObjects);
                
                // this.outlinePass.selectedObjects = selectObjects

                // 选择物体高亮
            }
            this.editor.signals.sceneGraphChanged.dispatch()
        })

        const getIntersects = (point:Vector2) => {
            _mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
            _raycaster.setFromCamera(_mouse, camera);
      
            // 筛选需要检测的对象
            const objects:Object3D[] = [];
      
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
      

        const mutiSelectId:Array<string> = [];

        const handelClick = (event:PointerEvent)=> {
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
    
            // 这里必须要进行拷贝，不然执行下一行后会有bug
            this.editor.signals.intersectionsDetected.dispatch(mutiSelectId);
    
            // 非多选模式需要清空，为下次单选做准备
            if (!event.ctrlKey) {
              mutiSelectId.length = 0;
            }
          }
        }

        const onMouseUp = (event:PointerEvent) => {
            const mousePosition = getMousePosition(event.clientX, event.clientY,this.renderer.domElement);
            _onUpPosition.fromArray(mousePosition);
      
            handelClick(event);
      
            this.renderer.domElement.removeEventListener('pointerup', onMouseUp);
          }

        const onMouseDown = (event:PointerEvent) => {
            // 鼠标左键点击则执行
            if (event.button !== 0) return;
            const mousePosition = getMousePosition(event.clientX, event.clientY,this.renderer.domElement);
            _onDownPosition.fromArray(mousePosition);

            this.renderer.domElement.addEventListener('pointerup', onMouseUp);
        }

        this.renderer.domElement.addEventListener('pointerdown', onMouseDown);
    }

    protected render(): void {
        this.onBeforeRender(this.editor, this.camera);

        this.renderer.clear();

        // this.composer.render()
        this.renderer.render(this.editor.scene, this.camera);
       
        this.renderer.render(this.editor.sceneHelper, this.camera);
     

        this.viewHelper.render(this.renderer);

        this.onAfterRenderScene(this.editor, this.camera);
     

        this.needsUpdate = false;

    }

    public setTransformMode(mode: transformMode) {
        this.transformControl.setMode(mode)
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

    public setSize(width: number, height: number): void {
      super.setSize(width, height);
      // this.composer.setSize( width, height );

			// this.effectFXAA.uniforms[ 'resolution' ].value.set( 1 / this.width, 1 / this.height );
    }
}

function getMousePosition(x:number, y:number,dom:HTMLElement):[number,number] {
    const { left, top, width, height } = dom.getBoundingClientRect();
    return [(x - left) / width, (y - top) / height];
  }

  function traverseObject(object:Object3D, extrudeIds:uuids, type:Array<string>, target:Object3D[]) {
    if (!extrudeIds.includes(object.uuid) && object.visible && !type.includes(object.type)) {
      target.push(object);
    //   for (let i = 0, l = object.children.length; i < l; i++) {
    //     traverseObject(object.children[i], extrudeIds, type,target);
    //   }
    }
  }


export { MainViewPort }