/*
 * @Date: 2023-08-09 00:36:11
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-10 01:09:17
 * @FilePath: /threejs-demo/packages/f-engine/src/core/src/MainViewPort.ts
 */
import { Vector3, type Object3D, type OrthographicCamera, type PerspectiveCamera, Euler } from "three";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { GPUStatsPanel } from 'three/examples/jsm/utils/GPUStatsPanel';
import StatsPanel from 'three/examples/jsm/libs/stats.module';
import { ViewPort } from "./ViewPort";
import type { Editor } from "./Editor";
import { ViewHelper } from "@/helper";




class MainViewPort extends ViewPort {
    public excludeObjects: Array<Object3D>;
    public excludeTypes: Array<string>;

    constructor(editor: Editor, camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement) {
        super(editor, camera, domElement);
        this.type = 'MainViewPort';

        this.excludeObjects = [];
        this.excludeTypes = [];

        const statePanel = new StatsPanel();
        const gpuPanel = new GPUStatsPanel(this.renderer.getContext());
        statePanel.addPanel(gpuPanel);
        statePanel.showPanel(0);
        statePanel.dom.style.position = 'absolute';
        domElement.append(statePanel.dom);

        const viewHelper = new ViewHelper(camera, domElement);

        const transformControl = new TransformControls(camera, this.renderer.domElement);
        this.editor.addHelper(transformControl);

        transformControl.addEventListener('change', () => {
            const { object } = transformControl;

            if (object !== undefined) {
                this.editor.signals.sceneGraphChanged.dispatch();
            }
        })

        const _objectPositionOnDown = new Vector3();
        const _objectRotationOnDown = new Euler();
        const _objectScaleOnDown = new Vector3();

        transformControl.addEventListener('mouseDown', () => {
            const { object } = transformControl;

            if (object !== undefined) {
                _objectPositionOnDown.copy(object.position);
                _objectRotationOnDown.copy(object.rotation);
                _objectScaleOnDown.copy(object.scale);

                this.orbitControls.enabled = false;
            }
        })

        transformControl.addEventListener('mouseUp', () => {
            const { object } = transformControl;

            if (object !== undefined) {
                switch (transformControl.getMode()) {
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

        const selectId:Array<string> = [];

        this.editor.signals.objectsRemoved.add((uuids: Array<string>) => {
            const selections: Set<string> = this.editor.getState('selections');

            const originSize = selections.size;
            uuids.forEach(uuid => selections.delete(uuid));

            if(originSize !== selections.size){
                selectId.length = 0
                for(let i of selections.values()){
                    selectId.push(i)
                }
                this.editor.selectByIds(selectId)
            }
        });



    }
}

export { MainViewPort }