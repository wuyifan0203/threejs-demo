/*
 * @Date: 2023-12-20 13:19:03
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-21 16:17:24
 * @FilePath: /threejs-demo/src/render/debugDepthPeeling.js
 */
import { FullScreenQuad } from '../lib/three/Pass.js';
import {
    WebGLRenderTarget, DepthTexture, DataTexture, Vector2, Mesh, Material, Color, WebGLRenderer, ShaderMaterial, NoBlending
} from '../lib/three/three.module.js'


function debugDeepPeeling(scene, camera) {
    const screenSize = new Vector2(1, 1);
    const renderer = new WebGLRenderer()
    const pixelRatio = renderer.getPixelRatio();
    renderer.autoClear = false;

    const depthCanvasGroup = document.createElement('div');
    const depthCanvasTitle = document.createElement('h3');
    depthCanvasTitle.textContent = 'Depth Canvas';
    depthCanvasGroup.appendChild(depthCanvasTitle);
    document.body.appendChild(depthCanvasGroup);

    const targetCanvasGroup = document.createElement('div');
    const targetCanvasTitle = document.createElement('h3');
    targetCanvasTitle.textContent = 'Target Canvas';
    targetCanvasGroup.appendChild(targetCanvasTitle);
    document.body.appendChild(targetCanvasGroup);

    const globalUniforms = {
        uPrevDepthTexture: { value: null },
        uReciprocalScreenSize: { value: new Vector2(1, 1) }
    }


    const deepLayersTarget = new WebGLRenderTarget()

    scene = scene.clone();
    scene.traverse((object) => {
        if (object instanceof Mesh && object.material instanceof Material) {
            const cloneMaterial = object.material.clone();
            // 关闭混合
            // cloneMaterial.blending = NoBlending;
            cloneMaterial.onBeforeCompile = (shader) => {
                // 赋值
                shader.uniforms.uReciprocalScreenSize = globalUniforms.uReciprocalScreenSize;
                shader.uniforms.uPrevDepthTexture = globalUniforms.uPrevDepthTexture;

                shader.fragmentShader = /* glsl */ `
                // --- DEPTH PEELING SHADER CHUNK (START) (uniform definition)
                uniform vec2 uReciprocalScreenSize;
                uniform sampler2D uPrevDepthTexture;
                // --- DEPTH PEELING SHADER CHUNK (END)
                ${shader.fragmentShader}`;

                //peel depth
                shader.fragmentShader = shader.fragmentShader.replace(
                    /}$/gm,
                    /* glsl */`
                    // --- DEPTH PEELING SHADER CHUNK (START) (peeling)
                      vec2 screenPos = gl_FragCoord.xy * uReciprocalScreenSize;
                      float prevDepth = texture2D(uPrevDepthTexture,screenPos).x;
                      if( prevDepth >= gl_FragCoord.z )
                        discard;
                        // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
                    // --- DEPTH PEELING SHADER CHUNK (END)
                    }`);
            }
            object.material = cloneMaterial;
            object.material.needsUpdate = true;
        }
    })

    const depthCanvas = [];

    const targetCanvas = [];

    const layers = [];

    let result = new DataTexture(new Uint8Array([1, 1, 1, 1]), 100, 100);

    const material = new ShaderMaterial({
        uniforms: { 'tDepth': { value: null }, },
        vertexShader: /* glsl */`
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
            `,
        fragmentShader: /* glsl */`
            varying vec2 vUv;
            uniform sampler2D tDepth;
            void main() {
                vec4 color = texture2D(tDepth, vUv); 
                float gray = (color.r + color.g + color.b) / 3.0; 
                gl_FragColor = vec4(gray, gray, gray, color.a);
            }
        `
    })
    const quad = new FullScreenQuad(material)


    function setDepth(depth) {
        while (depth < layers.length) {
            layers.pop().dispose();
        }
        const [w, h] = [screenSize.x * pixelRatio, screenSize.y * pixelRatio];
        // 初始化缺省的target
        while (depth > layers.length) {
            const renderTarget = new WebGLRenderTarget(w, h, { depthTexture: new DepthTexture(w, h) });
            layers.push(renderTarget);
        }

        while (depth < depthCanvas.length) {
            depthCanvasGroup.removeChild(depthCanvas.pop());
        }

        while (depth > depthCanvas.length) {
            const canvas = document.createElement('canvas');
            canvas.width = screenSize.x;
            canvas.height = screenSize.y;
            canvas.style.width = screenSize.x / 4 + 'px';
            canvas.style.height = screenSize.y / 4 + 'px';
            depthCanvas.push(canvas);
            depthCanvasGroup.appendChild(canvas);
        }


        while (depth < targetCanvas.length) {
            targetCanvasGroup.removeChild(targetCanvas.pop());
        }

        while (depth > targetCanvas.length) {
            const canvas = document.createElement('canvas');
            canvas.width = screenSize.x;
            canvas.height = screenSize.y;
            canvas.style.width = screenSize.x / 4 + 'px';
            canvas.style.height = screenSize.y / 4 + 'px';
            targetCanvas.push(canvas);
            targetCanvasGroup.appendChild(canvas);
        }
    }

    function setSize(width, height) {
        screenSize.set(width, height);
        const [w, h] = [width * pixelRatio, height * pixelRatio];
        result.dispose();
        result = new DataTexture(new Uint8Array(w * h), w, h)

        globalUniforms.uReciprocalScreenSize.value.set(1 / w, 1 / h);

        layers.forEach((renderTarget) => {
            renderTarget.setSize(w, h);
            renderTarget.depthTexture.dispose();
            renderTarget.depthTexture = new DepthTexture(w, h);
        })

        depthCanvas.forEach((canvas) => {
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = width / 4 + 'px';
            canvas.style.height = height / 4 + 'px';
        });

        targetCanvas.forEach((canvas) => {
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = width / 4 + 'px';
            canvas.style.height = height / 4 + 'px';
        })

        deepLayersTarget.setSize(w, h);
    }

    function renderImage() {
        // 记录调用前的状态，最后设置回去
        renderer.setClearColor(0x000000);
        layers.reduceRight((prevDepthTexture, layer, index) => {
            globalUniforms.uPrevDepthTexture.value = prevDepthTexture;
            const originTarget = renderer.getRenderTarget();
            drawTexture(targetCanvas[index], renderer, layer)
            renderer.setRenderTarget(layer);
            renderer.clear();
            renderer.render(scene, camera);

            material.uniforms.tDepth.value = layer.depthTexture;
            renderer.setRenderTarget(deepLayersTarget);
            renderer.clear();
            quad.render(renderer);
            drawTexture(depthCanvas[index], renderer, deepLayersTarget)
            renderer.setRenderTarget(originTarget);

            return layer.depthTexture;

        }, result);

        renderer.setRenderTarget(null);
        renderer.clear();
    }

    return { setDepth, renderImage, setSize }
}

function drawTexture(canvas, renderer, target) {
    const context = canvas.getContext('2d');
    const [x, y] = [canvas.width, canvas.height];
    const pixels = new Uint8Array(x * y * 4);
    renderer.readRenderTargetPixels(target, 0, 0, x, y, pixels);

    const imageData = context.createImageData(x, y);
    imageData.data.set(pixels);
    context.putImageData(imageData, 0, 0);

    context.translate(0, y);
    context.scale(1, -1);
    context.drawImage(canvas, 0, 0, x, y, 0, 0, x, y);
}

export { debugDeepPeeling }

