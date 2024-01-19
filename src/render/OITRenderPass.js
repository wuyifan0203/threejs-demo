/*
 * @Date: 2024-01-19 13:45:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-19 17:30:31
 * @FilePath: /threejs-demo/src/render/OITRenderPass.js
 */
import { FullScreenQuad, Pass } from '../lib/three/Pass.js';
import {
    Color,
    Vector2,
    WebGLRenderTarget,
    DepthTexture,
    DataTexture,
    NoBlending,
    ShaderMaterial
} from '../lib/three/three.module.js';

const _oldColor = new Color();

const renderMaterial = new ShaderMaterial({
    uniforms: {
        tDiffuse: { value: null },
        opacity: { value: 1.0 },
    },
    vertexShader: /*glsl*/ `
          varying vec2 vUv;
              void main() {
                  vUv = uv;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
              }`,
    fragmentShader: /*glsl*/ `
          uniform float opacity;
          uniform sampler2D tDiffuse;
          varying vec2 vUv;
          void main() {
              gl_FragColor = texture2D( tDiffuse, vUv );
              gl_FragColor.a *= opacity;
          }`,
    transparent: true,
    depthTest: true,
    depthWrite: true,
});


class OITRenderPass extends Pass {
    constructor(scene, camera) {
        super();
        this.scene = scene;
        this.camera = camera;

        this.uniforms = {
            uPrevDepthTexture: { value: null },
            uReciprocalScreenSize: { value: new Vector2(1, 1) }
        }
        this.layersNumber = 0;
        this.size = new Vector2(1, 1);
        this.layers = [];

        this.dataTexture = new DataTexture([1, 1, 1, 1], 1, 1);
        this.quad = new FullScreenQuad(renderMaterial);
    }

    setSize(width, height) {
        this.size.set(width, height);
        this.uniforms.uReciprocalScreenSize.value.set(1 / width, 1 / height);

        this.layers.forEach((target) => {
            target.setSize(width, height);
            target.depthTexture.dispose();
            target.depthTexture = new DepthTexture(width, height);
        })
    }

    render(renderer, writeBuffer, readBuffer/*, deltaTime, maskActive */) {

        const oldAutoClear = renderer.autoClear;
        const oldTarget = renderer.getRenderTarget();
        renderer.getClearColor(_oldColor);

        this.replaceMaterials();
        renderer.autoClear = false;

        this.layers.reduceRight((prevDepthTexture, layer) => {
            this.uniforms.uPrevDepthTexture.value = prevDepthTexture;

            renderer.setRenderTarget(layer);
            renderer.clear();
            renderer.render(this.scene, this.camera);

            return layer.depthTexture;

        }, this.dataTexture);

        if (this.clearDepth) {

            renderer.clearDepth();
            
        }

        renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);

        this.layers.forEach((layer) => {
            this.quad.material.uniforms.tDiffuse.value = layer.texture;
            
            this.quad.material.needsUpdate = true;
            this.quad.render(renderer);
        })

        renderer.setRenderTarget(oldTarget);
        renderer.setClearColor(_oldColor);
        renderer.autoClear = oldAutoClear;
    }

    setLayerNumber(layersNum) {
        layersNum = Math.floor(layersNum);
        if (layersNum <= 0) {
            return console.warn('OITRenderPass layersNumber cannot be smaller than 1');
        }

        this.layersNumber = layersNum;

        while (layersNum < this.layers.length) {
            this.layers.pop().dispose();
        }

        const { x, y } = this.size;

        while (layersNum > this.layers.length) {
            const renderTarget = new WebGLRenderTarget(x, y, { depthTexture: new DepthTexture(x, y) });
            this.layers.push(renderTarget);
        }
    }

    replaceMaterials() {
        this.scene.traverse((object) => {
            if (object?.isMesh) {
                if (Array.isArray(object.material)) {
                    object.material.forEach((material, i) => {
                        if (material.userData?.isOITMaterial) {
                            const oitMaterial = material.clone();

                            oitMaterial.blending = NoBlending;
                            oitMaterial.userData.isOITMaterial = true;
                            oitMaterial.userData.originalMaterial = material;
                            oitMaterial.onBeforeCompile = onBeforeCompile.bind(this);
                            oitMaterial.needsUpdate = true;

                            object.material[i] = oitMaterial;
                        }
                    });
                } else {
                    if (object.material.userData?.isOITMaterial) {
                        const oitMaterial = object.material.clone();

                        oitMaterial.blending = NoBlending;
                        oitMaterial.userData.isOITMaterial = true;
                        oitMaterial.userData.originalMaterial = object.material;
                        oitMaterial.onBeforeCompile = onBeforeCompile.bind(this);
                        oitMaterial.needsUpdate = true;

                        object.material = oitMaterial;
                    }
                }
            }
        })
    }
}

const replaceShader = /*glsl*/ `
      vec2 screenPos = gl_FragCoord.xy * uReciprocalScreenSize;
      float prevDepth = texture2D(uPrevDepthTexture, screenPos).x;
      if (prevDepth >= gl_FragCoord.z)
          discard;
    }`;

function onBeforeCompile(shader, renderer) {
    shader.uniforms.uReciprocalScreenSize = this.globalUniforms.uReciprocalScreenSize;
    shader.uniforms.uPrevDepthTexture = this.globalUniforms.uPrevDepthTexture;

    shader.fragmentShader = /* glsl */ `
      uniform vec2 uReciprocalScreenSize;
      uniform sampler2D uPrevDepthTexture;
      ${shader.fragmentShader}`;

    shader.fragmentShader = shader.fragmentShader.replace(/}$/gm, replaceShader);
}

export { OITRenderPass };