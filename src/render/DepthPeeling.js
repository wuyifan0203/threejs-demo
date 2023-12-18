/*
 * @Date: 2023-12-18 19:08:43
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-18 21:01:45
 * @FilePath: /threejs-demo/src/render/DepthPeeling.js
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
import { CopyShader } from "../lib/three/CopyShader.js";

class DepthPeeling {
    constructor(width, height, depth, pixelRatio) {
        this.globalUniforms = {
            uPrevDepthTexture: { value: null },
            uReciprocalScreenSize: { value: new Vector2(1, 1) }
        }

        this.layers = []; // WebGLRenderTarget[]
        this._depth = 3;

        const material = new ShaderMaterial({
            ...CopyShader,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        })
        this.quad = new FullScreenQuad(material);
        // 最终结果的输出         构造函数的参数 data ,width , height
        this.result = new DataTexture(new Uint8Array([1, 1, 1, 1]), 1, 1);

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
                // 关闭混合
                cloneMaterial.blending = NoBlending;

                cloneMaterial.onBeforeCompile = (shader) => {
                    console.log(shader);
                }

            }

        })

    }

    render(renderer, camera) {
        // 记录调用前的状态，最后设置回去
        const originTarget = renderer.getRenderTarget();
        const originAutoClear = renderer.autoClear;
        renderer.getClearColor(this.originClearColor);

        renderer.autoClear = false;
        renderer.setClearColor(0x000000);

        this.layers.reduceRight((prevDepthTexture, layer) => {
            this.globalUniforms.uPrevDepthTexture = prevDepthTexture;

            renderer.setRenderTarget(layer);
            renderer.clear();
            renderer.render(this.scene, camera);

            return layer.depthTexture;

        }, this.result);

        renderer.setRenderTarget(originTarget);
        renderer.autoClear = originAutoClear;
        renderer.clear();

        this.layers.forEach((layer)=>{
            this.quad.material.uniforms.tDiffuse.value = layer.texture;
            this.quad.material.needsUpdate = true;
            this.quad.render(renderer);
        })

        renderer.setClearColor(this.originClearColor);
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