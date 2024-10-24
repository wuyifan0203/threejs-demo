/*
 * @Date: 2024-01-19 17:43:13
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-10-24 16:00:33
 * @FilePath: \threejs-demo\src\lib\util\catch.js
 */
import {
  Vector2,
  WebGLRenderTarget,
  WebGLRenderer,
  ShaderMaterial,
} from "../three/three.module.js";
import { FullScreenQuad } from "../three/Pass.js";

const size = new Vector2();
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
/**
 * @description: 用来抓取已渲染的 WebGLRenderTarget，查看内容
 * @param {WebGLRenderer} renderer
 * @param {WebGLRenderTarget} target
 * @return {string} dataURL
 */
function catchRenderTarget(renderer, target) {
  size.set(target.width, target.height);

  const { x: width, y: height } = size;
  canvas.width = width;
  canvas.height = height;

  const pixels = new Uint8Array(width * height * 4);
  renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);

  const imageData = ctx.createImageData(width, height);

  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);

  ctx.translate(0, height);
  ctx.scale(1, -1);
  ctx.drawImage(canvas, 0, 0, width, height, 0, 0, width, height);

  const dataURL = canvas.toDataURL("image/png");

  return dataURL;
}

const defaultTarget = new WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight
);
const quad = new FullScreenQuad(
  new ShaderMaterial({
    uniforms: { tDiffuse: { value: null } },
    vertexShader: /* glsl */ `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`,
    fragmentShader: /* glsl */ `
            uniform sampler2D tDiffuse;
            varying vec2 vUv;
            void main() {
                gl_FragColor =  texture2D( tDiffuse, vUv );
            }`,
  })
);
/**
 * @description: 用来抓取texture，查看内容
 * @param {Texture} texture
 * @param {WebGLRenderer} renderer
 * @param {WebGLRenderTarget} target
 * @return {string} dataURL
 */
function catchTexture(texture, renderer, target = defaultTarget) {
  quad.material.uniforms.tDiffuse.value = texture;
  quad.material.needsUpdate = true;

  const originTarget = renderer.getRenderTarget();

  renderer.setRenderTarget(target);

  quad.render(renderer);

  const result = catchRenderTarget(renderer, target);

  renderer.setRenderTarget(originTarget);

  return result;
}

function printfImage(name = " ", dateURL) {
  console.log(
    `%c ${name}`,
    `background-image: url(${dateURL});
       background-size: contain;
       background-repeat: no-repeat;
       padding: 200px;
       white-space: nowrap;
      `
  );
}

function printTexture(name, texture, renderer, target = defaultTarget) {
  printfImage(name, catchTexture(texture, renderer, target));
}

function printRenderTarget(name, renderer, target) {
  printfImage(name, catchRenderTarget(renderer, target));
}

export {
  catchRenderTarget,
  catchTexture,
  printfImage,
  printTexture,
  printRenderTarget,
};
