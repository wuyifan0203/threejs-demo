/*
 * @Date: 2023-06-13 23:01:08
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-14 01:07:56
 * @FilePath: /threejs-demo/packages/app/CAD/example/new.js
 */
import {Control, Editor} from '../build/cad.esm.js'
import {FogExp2, GridHelper} from 'three'

window.onload = ()=>{
    init()
}

function init() {
    const dom = document.getElementById('cad');
    const {width,height} = dom.getBoundingClientRect()
    const editor = new Editor(dom);
    editor.setSize(width,height);
    const control = new Control(editor);
    // editor.scene.fog = new FogExp2('#ffffff',0.025)
    editor.render();
    const gridHelper = new GridHelper(50,50);
    gridHelper.isHelper = true;
    editor.addObject(gridHelper);




    window.editor = editor
}