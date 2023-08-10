/*
 * @Date: 2023-08-09 00:36:11
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-11 01:25:13
 * @FilePath: /threejs-demo/packages/f-engine/src/core/src/MainViewPort.ts
 */
import { Vector3, type Object3D, type OrthographicCamera, type PerspectiveCamera, Euler, Clock } from "three";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import StatsPanel from 'three/examples/jsm/libs/stats.module';
import { ViewPort } from "./ViewPort";
import type { Editor } from "./Editor";
import { ViewHelper } from "@/helper";
import { TransformControlHandler } from "./TransformControlHandler";

type uuids = Array<string>;
type transformMode = 'translate' | 'scale' | 'rotate'


class MainViewPort extends ViewPort {
    public excludeObjects: Array<Object3D>;
    public excludeTypes: Array<string>;
    private transformControl: TransformControls;
    private viewHelper: ViewHelper;
    private statePanel: StatsPanel;
    private clock: Clock;
    private needsUpdate: boolean
    constructor(editor: Editor, camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement) {
        super(editor, camera, domElement);
        this.type = 'MainViewPort';
        this.clock = new Clock();
        this.needsUpdate = false;

        this.renderer.setAnimationLoop(this.animate)

        this.excludeObjects = [];
        this.excludeTypes = [];

        this.statePanel = new StatsPanel();
        this.statePanel.showPanel(0);
        this.statePanel.dom.style.position = 'absolute';
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

            uuids.forEach(uuid => {
                const obj = this.editor.getObjectByUuid(uuid)
                obj && selectObjects.push(obj)
            })

            if (selectObjects.length !== 0) {
                if (selectObjects.length === 1) {
                    this.transformControl.attach(selectObjects[0])
                }

                // 选择物体高亮
            }
            this.editor.signals.sceneGraphChanged.dispatch()
        })
    }

    protected render(): void {
        this.onBeforeRender(this.editor, this.camera);

        this.renderer.clear();
  
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
}




export { MainViewPort }