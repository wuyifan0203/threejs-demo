import {
    Color,
    Fog,
    Vector3,
    Clock,
    Object3D,
    CanvasTexture,
    PlaneGeometry,
    Triangle,
    InstancedMesh,
    MeshBasicMaterial,
    MathUtils,
    InstancedBufferAttribute,
    ShaderMaterial,
    ShaderLib,
    UniformsUtils,
    Mesh,
    MeshNormalMaterial
} from "three";
import { update, Tween } from "../lib/other/tween.esm.js";
import { SimplexNoise } from "../lib/custom//SimplexNoise.js";
import {
    initOrbitControls,
    initPerspectiveCamera,
    initRenderer,
    initScene,
    resize
} from "../lib/tools/common.js";

window.onload = () => {
    init();
}

const dummy = new Object3D();

function init() {
    const renderer = initRenderer();
    const scene = initScene();
    scene.fog = new Fog(0xffffff, 100, 150);
    scene.background = new Color(0xffffff);
    const camera = initPerspectiveCamera(new Vector3(0, 3, 8).setLength(50));

    const orbitControls = initOrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    resize(renderer, camera);

    const clock = new Clock();
    let t = 0;
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    console.log('maxAnisotropy', maxAnisotropy);

    const terrain = new TextTerrain(maxAnisotropy);

    scene.add(terrain);


    function render() {
        let dt = clock.getDelta();
        t += dt;
        update();
        controls.update();
        // textTerrain.instancedMesh.instanceMatrix.needsUpdate = true;
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

}


function createTextureCanvas(content) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const size = 2048;
    canvas.width = canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    const [dim, dimStep] = [8, size / 8];
    ctx.fillStyle = `rgba(0, 0, 0, 1)`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${dimStep * 0.9}px Arial`;
    for (let j = 0, k = content.length; j < k; j++) {
        const x = (j % dim + 0.5) * dimStep; // 一行8个 间隔0.5
        const y = size - (Math.floor(j / dim) + 0.5) * dimStep; // 一行8个 间隔0.5
        ctx.fillText(content[j], x, y);
    }

    return canvas;
}

const triangle = new Triangle();
const normal = new Vector3();
const vTmp = new Vector3();

class TextTerrain extends Object3D {
    static simplex = new SimplexNoise();
    static getY(x, z) {
        return TextTerrain.simplex.noise(x * 0.01, z * 0.01) * 7.5;
    }
    constructor(anisotropy) {
        super();

        const content = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"];
        const textTextureCanvas = createTextureCanvas(content);
        const canvasTexture = new CanvasTexture(textTextureCanvas);
        canvasTexture.anisotropy = anisotropy;

        const tileNum = 200;
        const letterIdxArray = new Float32Array(tileNum * tileNum);
        for (let i = 0, l = letterIdxArray.length, max = content.length - 1; i < l; i++) {
            letterIdxArray[i] = MathUtils.randInt(0, max);
        }

        const geometry = new PlaneGeometry();
        geometry.setAttribute('letterIdx', new InstancedBufferAttribute(letterIdxArray, 1));


        // this.add(new Mesh(new PlaneGeometry(10, 10), new MeshBasicMaterial({ map: canvasTexture, transparent: true })));


        const material = new MeshBasicMaterial({
            side: 2,
            map: canvasTexture,
            transparent: true,
            alphaTest: 0.01,
        });

        material.onBeforeCompile = (shader) => {
            shader.vertexShader = /*glsl*/`
                    attribute float letterIdx;
                    varying float vLetterIdx;
                    ${shader.vertexShader}
                `.replace(
                   /*glsl*/`#include <uv_vertex>`,
                   /*glsl*/`
                        #include <uv_vertex>
                        vLetterIdx = letterIdx;
                   `
            );
            shader.fragmentShader = /*glsl*/`
                    varying float vLetterIdx;
                    ${shader.fragmentShader}
                `.replace(
                    /*glsl*/`#include <map_fragment>`,
                    /*glsl*/`
                        float letterIdx = floor(vLetterIdx + 0.1);
                        float tileStep = 1.0 / 8.0;
                        float u = mod(letterIdx , 8.0);
                        float v = floor(letterIdx / 8.0);
                        vec2 tileUV = (vec2(u,v) + vMapUv) * tileStep;
                        vec4 sampledDiffuseColor = texture2D( map, tileUV );
            			diffuseColor *= sampledDiffuseColor;
                    `
            )
        }

        const material2 = new ShaderMaterial({
            uniforms:{
                tDiffuse:{ value:canvasTexture },
            },
            vertexShader:/*glsl*/`
                varying vec2 vUv;
                attribute float letterIdx;
                varying float vLetterIdx;

                void main() {
                    vUv = uv;
                    vLetterIdx = letterIdx;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader:/*glsl*/`
                uniform sampler2D tDiffuse;
                varying float vLetterIdx;
                varying vec2 vUv;
                void main() {
                    gl_FragColor = texture2D( tDiffuse, vUv );
                    float letterIdx = floor(vLetterIdx + 0.1);
                    float tileStep = 1.0 / 8.0;
                    float u = mod(letterIdx , 8.0);
                    float v = floor(letterIdx / 8.0);
                    vec2 tileUV = (vec2(u,v) + vUv) * tileStep;
                    gl_FragColor = texture2D( tDiffuse, tileUV );
                }
            `,
        })

        const material3 = new MeshNormalMaterial();


        const instanceMesh = new InstancedMesh(geometry, material, tileNum * tileNum);

        this.add(instanceMesh);

        this.finals = [];
        const halfTileNum = (1 - tileNum) / 2;
        for (let z = 0; z < tileNum; z++) {
            for (let x = 0; x < tileNum; x++) {
                dummy.position.x = halfTileNum + x;
                dummy.position.z = halfTileNum + z;
                this.finals.push(TextTerrain.setFinals());
                instanceMesh.setMatrixAt(x + z * tileNum, dummy.matrix);
            }
        }

        function getFreeLetterIndex() {
            let letterIndex = Math.floor(Math.random() * this.finals.length);
            return this.finals[letterIndex].inAction ? getFreeLetterIndex() : letterIndex;
        }

        const height = 30;
        function action(delay) {
            const letterIndex = getFreeLetterIndex();
            const letter = this.finals[letterIndex];


        }

        this.actions = [].fill()
    }

    static setFinals() {
        const { x, z } = dummy.position;
        const y0 = this.getY(x, z);
        const y1 = this.getY(x, z - 1);
        const y2 = this.getY(x + 1, z);
        dummy.position.y = y0;

        triangle.a.set(x, y1, z - 1);
        triangle.b.set(x, y0, z);
        triangle.c.set(x + 1, y2, z);
        triangle.getNormal(normal);

        vTmp.copy(dummy.position).add(normal);
        dummy.lookAt(vTmp);
        dummy.rotation.z = 0;
        dummy.updateMatrix();

        return {
            y: y0,
            position: dummy.position.clone(),
            rotation: dummy.rotation.clone(),
            isAction: false,
            mediators: {
                v1: new Vector3(),
                v2: new Vector3()
            }

        }


    }
}



