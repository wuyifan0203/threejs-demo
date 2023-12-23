/*
 * @Date: 2023-12-18 19:08:43
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-24 00:58:57
 * @FilePath: /threejs-demo/src/render/DepthPeeling2.js
 */

import {
    DataTexture,
    Vector2,
    ShaderMaterial,
    Color,
    Scene,
    WebGLRenderTarget,
    DepthTexture,
    Material,
    NoBlending,
    Mesh
} from "../lib/three/three.module.js";
import { FullScreenQuad } from "../lib/three/Pass.js";

const vertexShader = /* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`

const fragmentShader = /* glsl */`
	uniform float opacity;
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
       // CopyShader with GammaCorrectionShader 
        gl_FragColor = LinearTosRGB(texture2D( tDiffuse, vUv ));
        gl_FragColor.a *= opacity;

    }`;

const replaceShader =  /* glsl */`
        // --- DEPTH PEELING SHADER CHUNK (START) (peeling)
        vec2 screenPos = gl_FragCoord.xy * uReciprocalScreenSize;
        float prevDepth = texture2D(uPrevDepthTexture, screenPos).x;
        if (prevDepth >= gl_FragCoord.z)
            discard;
        // --- DEPTH PEELING SHADER CHUNK (END)
    }`

class DepthPeeling {
    constructor(width, height, depth, pixelRatio) {
        this.globalUniforms = {
            uPrevDepthTexture: { value: null },
            uReciprocalScreenSize: { value: new Vector2(1, 1) }
        }

        this.layers = []; // WebGLRenderTarget[]
        this._depth = 3;
        this.result = new DataTexture(new Uint8Array([1, 1, 1, 1]), 1, 1);
        const material = new ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                opacity: { value: 1.0 }
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            depthTest: true,
            depthWrite: true,
        })
        this.quad = new FullScreenQuad(material);

        this.screenSize = new Vector2(1, 1);
        this.pixelRatio = 1;
        // 用来暂存原始render得颜色
        this.originClearColor = new Color();
        this.scene = new Scene();

        this.setScreenSize(width, height, pixelRatio);
        this.setDepth(depth);
    }

    add(object) {
        const cloneObject = object.clone(true);
        cloneObject.traverse((object) => {
            if (object instanceof Mesh && object.material instanceof Material) {
                const cloneMaterial = object.material.clone();
                cloneMaterial.blending = NoBlending;
                cloneMaterial.onBeforeCompile = (shader) => {
                    // 赋值
                    shader.uniforms.uReciprocalScreenSize = this.globalUniforms.uReciprocalScreenSize;
                    shader.uniforms.uPrevDepthTexture = this.globalUniforms.uPrevDepthTexture;

                    shader.fragmentShader = /* glsl */ `
                    // --- DEPTH PEELING SHADER CHUNK (START) (uniform definition)
                    uniform vec2 uReciprocalScreenSize;
                    uniform sampler2D uPrevDepthTexture;
                    // --- DEPTH PEELING SHADER CHUNK (END)
                    ${shader.fragmentShader}`;

                    //peel depth
                    shader.fragmentShader = shader.fragmentShader.replace(/}$/gm, replaceShader);
                }
                object.material = cloneMaterial;
                object.material.needsUpdate = true;
            }
        })
        this.scene.add(cloneObject);
    }

    render(renderer, camera) {
        // 记录调用前的状态，最后设置回去
        const originTarget = renderer.getRenderTarget();
        const originAutoClear = renderer.autoClear;
        renderer.getClearColor(this.originClearColor);

        renderer.autoClear = false;
        renderer.setClearColor(0x000000);

        this.layers.reduceRight((prevDepthTexture, layer) => {
            this.globalUniforms.uPrevDepthTexture.value = prevDepthTexture;
            renderer.setRenderTarget(layer);
            renderer.clear();
            renderer.render(this.scene, camera);
            return layer.depthTexture;
        }, this.result);

        renderer.setRenderTarget(null);
        renderer.clear();

        this.layers.forEach((layer) => {
            this.quad.material.uniforms.tDiffuse.value = layer.texture;
            this.quad.material.needsUpdate = true;
            this.quad.render(renderer);
        })

        renderer.setClearColor(this.originClearColor);
        renderer.autoClear = originAutoClear;
    }

    setScreenSize(width, height, pixelRatio) {
        this.screenSize.set(width, height);
        this.pixelRatio = pixelRatio;
        const [w, h] = [width * pixelRatio, height * pixelRatio];

        this.globalUniforms.uReciprocalScreenSize.value.set(1 / w, 1 / h);

        this.layers.forEach((renderTarget) => {
            renderTarget.setSize(w, h);
            renderTarget.depthTexture.dispose();
            renderTarget.depthTexture = new DepthTexture(w, h);
        })

        this.result.dispose();
        this.result = new DataTexture(new Uint8Array(w * h), w, h);
    }

    setDepth(depth) {
        // 删除多余的target
        while (depth < this.layers.length) {
            this.layers.pop().dispose();
        }

        this._depth = depth;

        const w = this.screenSize.width * this.pixelRatio;
        const h = this.screenSize.height * this.pixelRatio;

        // 初始化缺省的target
        while (depth > this.layers.length) {
            const renderTarget = new WebGLRenderTarget(w, h, { depthTexture: new DepthTexture(w, h) });
            this.layers.push(renderTarget);
        }
    }
}

export { DepthPeeling }