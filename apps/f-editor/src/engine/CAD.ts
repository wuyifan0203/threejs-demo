/*
 * @Date: 2023-08-20 23:51:53
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-21 01:03:15
 * @FilePath: /threejs-demo/apps/f-editor/src/engine/CAD.ts
 */
import {Editor,MainViewPort} from '@f/engine';
import { GridHelper, OrthographicCamera } from 'three';

const aspect = window.innerWidth / window.innerHeight;
const camera = new OrthographicCamera(-15, 15, 15 * aspect, - 15* aspect, 0, 10000);
camera.position.set(0, 200, 500);
camera.up.set(0, 0, 1);
camera.lookAt(0,0,0);
camera.updateProjectionMatrix();

const grid = new GridHelper(50,50,'#aaaaaa','#bbbbbb');
grid.rotateX(Math.PI/2);

class CAD{
    editor: Editor;
    mainViewPort: MainViewPort;
    depulyDOM: HTMLElement;
    mainDOM: HTMLElement;
    constructor(mainDOM:HTMLElement,depulyDOM:HTMLElement){
        this.mainDOM = mainDOM;
        this.depulyDOM = depulyDOM;
        this.editor = new Editor();
        this.mainViewPort = new MainViewPort(this.editor,camera,mainDOM);

        this.resetState() 
    }

    setSize(){
        const {width,height} = this.mainDOM.getBoundingClientRect();
        this.mainViewPort.setSize(width,height);
    }

    resetState(){
        this.editor.addHelper(grid);

        this.editor.needsUpdate = true;

    }
}

export {CAD}