/*
 * @Date: 2024-01-19 17:43:13
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-22 10:55:33
 * @FilePath: /threejs-demo/src/lib/util/catch.js
 */
import { Vector2, WebGLRenderTarget, WebGLRenderer, ShaderMaterial } from "../three/three.module.js";
import { FullScreenQuad } from '../three/Pass.js'

/**
 * @description: 用来抓取已渲染的 WebGLRenderTarget，查看内容
 * @param {WebGLRenderer} renderer
 * @param {WebGLRenderTarget} target
 * @return {string} dataURL
 */
function catchRenderTarget(renderer, target) {

    const size = new Vector2();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    return ((renderer, target) => {
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
        // ctx.scale(1, -1);
        ctx.drawImage(canvas, 0, 0, width, height, 0, 0, width, height);

        const dataURL = canvas.toDataURL('image/png');

        return dataURL;

    })(renderer, target)

}

/**
 * @description: 用来抓取texture，查看内容
 * @param {Texture} texture
 * @param {WebGLRenderer} renderer
 * @param {WebGLRenderTarget} target
 * @return {string} dataURL
 */
function catchTexture(texture, renderer, target) {
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
                vec4 color = texture2D( tDiffuse, vUv );
                float average = ( color.r + color.g + color.b ) / 3.0;
                gl_FragColor = vec4( vec3( average ), color.a );
            }`,
        }),
    );

    return ((texture, renderer, target) => {
        quad.material.uniforms.tDiffuse.value = texture;

        const originTarget = renderer.getRenderTarget();

        renderer.setRenderTarget(target);

        quad.render(renderer);

        renderer.setRenderTarget(originTarget);

        return catchRenderTarget(renderer, target);

    })(texture, renderer, target);

}


function printfImage(name = ' ', dateURL) {
    console.log(
        `%c ${name}`,
        `background-image: url(${dateURL});
       background-size: contain;
       background-repeat: no-repeat;
       padding: 200px;
       white-space: nowrap;
      `,
    );
}

export {
    catchRenderTarget,
    catchTexture,
    printfImage
}