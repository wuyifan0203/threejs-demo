/*
 * @Date: 2023-06-13 23:01:08
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-21 18:22:32
 * @FilePath: /threejs-demo/packages/app/CAD/example/new.js
 */
import {ViewPort, Editor} from '../build/cad.esm.js'
import {FogExp2, GridHelper} from 'three'

window.onload = ()=>{
    init()
}

function init() {
    const dom = document.getElementById('cad');
    const editor = new Editor(dom);
    const viewPort = new ViewPort(editor)

    dom.addEventListener('resize',()=>{
        editor.signals.windowResize.dispatch()
    })


    window.editor = editor
}