/*
 * @Date: 2023-09-21 10:22:38
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-21 11:23:24
 * @FilePath: /threejs-demo/packages/f-engine/src/controls/src/MouseControlHandler.ts
 */
import { Object3D, Raycaster, Vector2 } from "three";
import type { Editor, MainViewPort } from '../../core';
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

class MouseControlHandler {
    private domElement: HTMLElement;
    private _mouse = new Vector2();
    private _onDownPosition = new Vector2();
    private _onUpPosition = new Vector2();
    private editor: Editor;
    private multiSelectId: Array<string> = [];
    private _raycaster: Raycaster;
    private viewPort: MainViewPort;
    private transformControls: TransformControls;

    constructor(mainViewPort: MainViewPort, editor: Editor) {
        this.viewPort = mainViewPort;
        this.domElement = mainViewPort.getRenderer().domElement;
        this._raycaster = mainViewPort.getRaycaster();
        this.editor = editor;
        this.transformControls = mainViewPort.getTransformControls();
    }

    public handleMouseDown(event: PointerEvent) {
        // 鼠标左键点击则执行
        if (event.button !== 0) return;
        
        const mousePosition = getMousePosition(event.clientX, event.clientY, this.domElement);
        this._onDownPosition.fromArray(mousePosition);

        this.domElement.addEventListener('pointerup', this.handleMouseUp.bind(this));
    }

    private handleMouseUp(event: PointerEvent) {        
        const mousePosition = getMousePosition(event.clientX, event.clientY, this.domElement);
        this._onUpPosition.fromArray(mousePosition);

        this.handelClick(event);

        this.domElement.removeEventListener('pointerup', this.handleMouseUp);
    }

    private handelClick(event: PointerEvent) {
        if (this._onDownPosition.distanceTo(this._onUpPosition) === 0) {
            const intersects = this.getIntersects(this._onUpPosition);

            const intersectsObjectsUUId = intersects
                .map((item: { object: { uuid: any; }; }) => item?.object?.uuid)
                .filter((id: undefined) => id !== undefined);

            if (intersectsObjectsUUId.length === 0) {
                this.multiSelectId.length = 0;
            } else {
                this.multiSelectId.push(intersectsObjectsUUId[0]);
            }

            this.editor.signals.intersectionsDetected.dispatch(this.multiSelectId);

            // 非多选模式需要清空，为下次单选做准备
            if (!event.ctrlKey) {
                this.multiSelectId.length = 0;
            }
        }
    }

    private getIntersects(point: Vector2) {
        this._mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
        this._raycaster.setFromCamera(this._mouse, this.viewPort.camera);

        // 筛选需要检测的对象
        const objects: Object3D[] = [];

        // 排除的物体的id数组
        // 排除掉transformControl 和 selectionBox 和 extrudeObjects 和 不可见的
        const excludeUuids = [
            this.transformControls.uuid,
            ...this.viewPort.excludeObjects.map((o) => o.uuid),
        ];

        const excludeTypes = this.viewPort.excludeTypes;
        const { scene, sceneHelper } = this.editor

        for (let i = 0, l = scene.children.length; i < l; i++) {
            traverseObject(scene.children[i], excludeUuids, excludeTypes, objects);
        }

        for (let i = 0, l = sceneHelper.children.length; i < l; i++) {
            traverseObject(sceneHelper.children[i], excludeUuids, excludeTypes, objects);
        }


        return this._raycaster.intersectObjects(objects, false);
    }

}

function getMousePosition(x: number, y: number, dom: HTMLElement): [number, number] {
    const { left, top, width, height } = dom.getBoundingClientRect();
    return [(x - left) / width, (y - top) / height];
}

function traverseObject(object: Object3D, extrudeIds:string[], type: Array<string>, target: Object3D[]) {
    if (!extrudeIds.includes(object.uuid) && object.visible && !type.includes(object.type)) {
      target.push(object);
    }
  }

export { MouseControlHandler } 