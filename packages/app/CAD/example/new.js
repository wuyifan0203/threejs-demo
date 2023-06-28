/*
 * @Date: 2023-06-13 23:01:08
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-28 18:38:49
 * @FilePath: /threejs-demo/packages/app/CAD/example/new.js
 */
import {ViewPort, Editor} from '../build/cad.esm.js'
import {FogExp2, GridHelper,Mesh ,BoxGeometry,MeshBasicMaterial,AmbientLight,PointLight} from 'three'

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

    const boxGeometry = new BoxGeometry(2,2,2);
    const boxMaterial = new MeshBasicMaterial({color:0xff00f0})
    const boxMesh = new Mesh(boxGeometry,boxMaterial);

    editor.addObject(boxMesh)


    const btn = document.createElement('button')
    btn.innerText = 'click'
    btn.addEventListener('click',()=>{
        editor.toggleViewportCamera()
    })

    document.body.append(btn)




    window.editor = editor
}