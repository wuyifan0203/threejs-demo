/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-10-12 17:20:35
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-12 18:28:05
 * @FilePath: \threejs-demo\src\shader\material\normal.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { ShaderMaterial, Color } from "../three";

const vs = /* glsl */ `
// attribute vec3 position;
// attribute vec3 normal;
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
// uniform mat3 normalMatrix;
varying vec3 vNormal;

void main() {
    vNormal = normalMatrix * normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const fs = /* glsl */ `
precision mediump float;
uniform vec3 color;
varying vec3 vNormal;

void main() {
    vec3 normal = normalize(vNormal);
    // vNormal * 0.5 + 0.5作用是将[-1,1]的值，归一化到为[0,1]
    gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);
}
`;

class NormalMaterial extends ShaderMaterial {
  constructor() {
    super();
    this.uniforms = { color: { value: new Color() } };
    this.vertexShader = vs;
    this.fragmentShader = fs;
  }
}

export { NormalMaterial };
