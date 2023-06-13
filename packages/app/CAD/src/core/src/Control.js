/*
 * @Date: 2023-06-13 23:12:26
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-14 00:20:42
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Control.js
 */
import {TransformControls,TrackballControls, OrbitControls} from '../../controls'

class Control {
    constructor(editor){
        this.orbitControls  = new OrbitControls(editor.camera,editor.target);
        this.tranformControls = new TransformControls(editor.camera,editor.target);
 

        this.orbitControls.addEventListener('change',()=>{
            editor.render()
        })
    }
}

export {Control}