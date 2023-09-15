/*
 * @Date: 2023-08-20 23:51:53
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-15 17:36:53
 * @FilePath: /threejs-demo/apps/f-editor/src/engine/CAD.ts
 */
import type { Object3D } from 'three';
import { Editor, MainViewPort, Container } from '@f/engine';
import { createGridHelper, createOrthographicCamera } from '@/utils/cad';

const camera = createOrthographicCamera();
const grid = createGridHelper();


class CAD {
    editor: Editor;
    mainViewPort: MainViewPort;
    deputyDOM: HTMLElement;
    mainDOM: HTMLElement;
    container: Container;
    constructor(mainDOM: HTMLElement, deputyDOM: HTMLElement) {
        this.mainDOM = mainDOM;
        this.deputyDOM = deputyDOM;
        this.editor = new Editor();
        this.mainViewPort = new MainViewPort(this.editor, camera, mainDOM);
        this.container = new Container()

        this.resetState()
    }

    setSize() {
        const { width, height } = this.mainDOM.getBoundingClientRect();
        this.mainViewPort.setSize(width, height);
    }

    resetState() {
        grid.rotation.set(0,0,0);
        grid.rotateX(Math.PI / 2);
        this.editor.addHelper(grid);
    }

    resetCamera() {
        camera.position.set(0, 200, 500);
        camera.up.set(0, 0, 1);
        camera.lookAt(0, 0, 0);
        this.mainViewPort.orbitControls.target.set(0,0,0);
        this.mainViewPort.orbitControls.update();
    }

    addObject(object: Object3D | any, parent: Object3D | null = null, index: number | null = null) {
        object.traverse((obj) => {
            obj?.geometry && this.container.addGeometry(obj.geometry);
            obj?.material && this.container.addMaterial(obj.material);

            this.container.addObject(obj)
        })
        this.editor.addObject(object, parent, index);
    }
}

export { CAD }