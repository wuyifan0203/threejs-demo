/*
 * @Date: 2023-09-18 19:54:15
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-18 20:15:57
 * @FilePath: /threejs-demo/examples/src/shader/material/basicMaterial.js
 */
import { ShaderMaterial, Vector3 } from "../../lib/three/three.module.js";
import { vertexShaderSource, fragmentShaderSource } from './basicMaterialShader.js';


class BasicMaterial extends ShaderMaterial{
    constructor() {
        super();
        this.uniforms = { color: { value: new Vector3() } };
        this.vertexShader = vertexShaderSource;
        this.fragmentShader = fragmentShaderSource;
    }
}


export { BasicMaterial };