/*
 * @Date: 2023-09-18 19:54:15
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-12 17:53:10
 * @FilePath: \threejs-demo\src\shader\material\basic.js
 */
import { ShaderMaterial, Color } from "../../lib/three/three.module.js";

const vertexShaderSource = /* glsl */ `
    varying vec2 vUv;
    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShaderSource = /* glsl */ `
    uniform vec3 color;
    varying vec2 vUv;
    void main() {
        gl_FragColor = vec4(color, 1.0);
    }
`;

class BasicMaterial extends ShaderMaterial {
  constructor() {
    super();
    this.uniforms = { color: { value: new Color() } };
    this.vertexShader = vertexShaderSource;
    this.fragmentShader = fragmentShaderSource;
  }
}

export { BasicMaterial };
