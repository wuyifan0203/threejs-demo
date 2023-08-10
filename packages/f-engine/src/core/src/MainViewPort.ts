/*
 * @Date: 2023-08-09 00:36:11
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-10 20:56:37
 * @FilePath: /threejs-demo/packages/f-engine/src/core/src/MainViewPort.ts
 */
import { Vector3, type Object3D, type OrthographicCamera, type PerspectiveCamera, Euler, Clock } from "three";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import StatsPanel from 'three/examples/jsm/libs/stats.module';
import { ViewPort } from "./ViewPort";
import type { Editor } from "./Editor";
import { ViewHelper } from "@/helper";

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

        this.transformControl.addEventListener('change', () => {
            const { object } = this.transformControl;

            if (object !== undefined) {
                this.editor.signals.sceneGraphChanged.dispatch();
            }
        })

        const _objectPositionOnDown = new Vector3();
        const _objectRotationOnDown = new Euler();
        const _objectScaleOnDown = new Vector3();

        this.transformControl.addEventListener('mouseDown', () => {
            const { object } = this.transformControl;

            if (object !== undefined) {
                _objectPositionOnDown.copy(object.position);
                _objectRotationOnDown.copy(object.rotation);
                _objectScaleOnDown.copy(object.scale);

                this.orbitControls.enabled = false;
            }
        })

        this.transformControl.addEventListener('mouseUp', () => {
            const { object } = this.transformControl;

            if (object !== undefined) {
                switch (this.transformControl.getMode()) {
                    case 'translate':
                        if (!_objectPositionOnDown.equals(object.position)) {
                            // TODO command
                        }
                        break;
                    case 'rotate':
                        if (!_objectRotationOnDown.equals(object.rotation)) {
                            // TODO command
                        }
                        break;
                    case 'scale':
                        if (!_objectScaleOnDown.equals(object.scale)) {
                            // TODO command
                        }
                        break;
                    // skip default
                }
                this.orbitControls.enabled = true;
            }
        })

        const selectId: Array<string> = [];

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