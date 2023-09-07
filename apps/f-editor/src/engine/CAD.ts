/*
 * @Date: 2023-08-20 23:51:53
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-07 20:52:13
 * @FilePath: /threejs-demo/apps/f-editor/src/engine/CAD.ts
 */
import { Editor, MainViewPort, Container } from '@f/engine';
import { GridHelper, Object3D, OrthographicCamera } from 'three';

const aspect = window.innerWidth / window.innerHeight;
const camera = new OrthographicCamera(-15, 15, 15 * aspect, - 15 * aspect, 0, 10000);
camera.position.set(0, 200, 500);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);
camera.updateProjectionMatrix();

const grid = new GridHelper(50, 50, '#aaaaaa', '#bbbbbb');
grid.rotateX(Math.PI / 2);

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
        this.editor.addHelper(grid);
        this.editor.needsUpdate = true;
    }

    addObject(object: Object3D|any, parent: Object3D | null = null, index: number | null = 0) {
        object.traverse((obj)=>{
            obj?.geometry && this.container.addGeometry(obj.geometry);
            obj?.material && this.container.addMaterial(obj.material);

            this.container.addObject(obj)
        })
        this.editor.addObject(object, parent, index);
    }
}

export { CAD }