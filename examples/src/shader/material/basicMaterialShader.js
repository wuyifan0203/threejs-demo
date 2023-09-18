/*
 * @Date: 2023-09-18 19:44:20
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-18 20:34:00
 * @FilePath: /threejs-demo/examples/src/shader/material/basicMaterialShader.js
 */

const vertexShaderSource = /* glsl */`
    varying vec2 vUv;
    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`

const fragmentShaderSource = /* glsl */`
    uniform vec3 color;
    varying vec2 vUv;
    void main() {
        gl_FragColor = vec4(color, 1.0);
    }
`

export {
    vertexShaderSource,
    fragmentShaderSource
}