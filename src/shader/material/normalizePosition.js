/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-10-14 17:34:05
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-14 17:42:53
 * @FilePath: \threejs-demo\src\shader\material\normalizePosition.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { ShaderMaterial, Color } from "../../lib/three/three.module.js";

const vs = /* glsl */ `
// attribute vec3 position;
// attribute vec3 normal;
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
// uniform mat3 normalMatrix;
attribute vec3 normalPosition;
varying vec3 vNormalColor;

void main() {
    vNormalColor = normalPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const fs = /* glsl */ `
precision mediump float;
varying vec3 vNormalColor;
uniform vec3 color;

void main() {
    gl_FragColor = vec4(vNormalColor * color, 1.0);
}
`;

class NormalizePositionMaterial extends ShaderMaterial {
  constructor() {
    super();
    this.uniforms = { color: { value: new Color() } };
    this.vertexShader = vs;
    this.fragmentShader = fs;
  }
}

export { NormalizePositionMaterial };
