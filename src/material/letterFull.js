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
    InstancedBufferAttribute
} from "../lib/three/three.module.js";
import { update, Tween } from "../lib/other/tween.esm.js";
import { SimplexNoise } from "../lib/three/SimplexNoise.js";
import {
    initOrbitControls,
    initPerspectiveCamera,
    initRenderer,
    initScene,
    resize
} from "../lib/tools/common.js";

const simplex = new SimplexNoise();
window.onload = () => {
    init();
}

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

    renderer.setAnimationLoop(() => {
        let dt = clock.getDelta();
        t += dt;
        update();
        controls.update();
        // textTerrain.instancedMesh.instanceMatrix.needsUpdate = true;
        renderer.render(scene, camera);
    });

    // const content = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890", '爱', '妳'];
    // const textTextureCanvas = createTextureCanvas(content);
    // document.body.appendChild(textTextureCanvas);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    console.log('maxAnisotropy',maxAnisotropy);
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

class TextTerrain extends Object3D {
    constructor(anisotropy) {
        super();

        const content = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"];
        const textTextureCanvas = createTextureCanvas(content);
        const canvasTexture = new CanvasTexture(textTextureCanvas);
        canvasTexture.anisotropy = anisotropy;
        


    }
}



class TextTerrain2 extends Object3D {
    constructor(anisotropy) {
        super();
        // atlas
        let alphabet = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", '爱'];
        let textTexture = (() => {
            let c = document.createElement("canvas");
            let ctx = c.getContext("2d");
            let texSize = 2048;
            c.width = texSize;
            c.height = texSize;
            ctx.clearRect(0, 0, texSize, texSize);
            let dim = 8;
            let dimStep = texSize / dim;
            for (let i = 0; i < alphabet.length; i++) {
                let tileX = i % 8;
                let tileY = Math.floor(i / 8);
                let x = (tileX + 0.5) * dimStep;
                let y = texSize - (tileY + 0.5) * dimStep;
                ctx.fillStyle = `rgba(0, 0, 0, 1)`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = `bold ${dimStep * 0.9}px Arial`;
                ctx.fillText(alphabet[i], x, y);
            }
            let tex = new CanvasTexture(c);
            tex.colorSpace = "srgb";
            tex.anisotropy = anisotropy;
            return tex;
        })(); // atlas

        let tileDim = 200;

        let g = new PlaneGeometry();
        g.setAttribute(
            "letterIdx",
            new InstancedBufferAttribute(
                new Float32Array(
                    Array.from(
                        {
                            length: tileDim * tileDim
                        },
                        () => {
                            return MathUtils.randInt(0, alphabet.length - 1);
                        }
                    )
                ),
                1
            )
        );

        let m = new MeshBasicMaterial({
            map: textTexture,
            transparent: true,
            alphaTest: 0.01,
            side: 2,
            //forceSinglePass: true,
            onBeforeCompile: (shader) => {
                shader.vertexShader = `
        	attribute float letterIdx;
          varying float vLetterIdx;
        	${shader.vertexShader}
        `.replace(
                    `#include <uv_vertex>`,
                    `#include <uv_vertex>
          vLetterIdx = letterIdx;
          `
                );
                //console.log(shader.vertexShader);

                shader.fragmentShader = `
        	varying float vLetterIdx;
          ${shader.fragmentShader}
        `.replace(
                    `#include <map_fragment>`,
                    `
          float letterIdx = floor(vLetterIdx + 0.1);
          float tileStep = 1. / 8.;
          float u = mod(letterIdx, 8.);
          float v = floor(letterIdx / 8.);
          vec2 iUv = (vec2(u, v) + vMapUv) * tileStep;
          vec4 sampledDiffuseColor = texture2D( map, iUv );
					diffuseColor *= sampledDiffuseColor;
          `
                );
                //console.log(shader.fragmentShader);
            }
        });
        let io = new InstancedMesh(g, m, tileDim * tileDim);
        this.instancedMesh = io;

        this.dummy = new Object3D();

        this.finals = [];

        let tri = new Triangle();
        let n = new Vector3();
        let la = new Vector3();

        function getY(x, z) {
            return simplex.noise(x * 0.01, z * 0.01) * 7.5;
        }

        let setFinals = () => {
            let y0 = getY(this.dummy.position.x, this.dummy.position.z);
            let y1 = getY(this.dummy.position.x, this.dummy.position.z - 1);
            let y2 = getY(this.dummy.position.x + 1, this.dummy.position.z);
            this.dummy.position.y = y0;

            tri.a.set(this.dummy.position.x, y1, this.dummy.position.z - 1);
            tri.b.set(this.dummy.position.x, y0, this.dummy.position.z);
            tri.c.set(this.dummy.position.x + 1, y2, this.dummy.position.z);
            tri.getNormal(n);

            la.copy(this.dummy.position).add(n);
            this.dummy.lookAt(la);
            this.dummy.rotation.z = 0; // align along Z-axis of the terrain
            this.dummy.updateMatrix();

            this.finals.push({
                y: y0,
                pos: this.dummy.position.clone(),
                rot: this.dummy.rotation.clone(),
                dummy: new Object3D(),
                inAction: false,
                mediators: {
                    v: new Vector3(),
                    v2: new Vector3()
                }
            });
        };

        // make it grid
        for (let z = 0; z < tileDim; z++) {
            for (let x = 0; x < tileDim; x++) {
                this.dummy.position.x = -(tileDim - 1) * 0.5 + x;
                this.dummy.position.z = -(tileDim - 1) * 0.5 + z;
                setFinals(this.dummy.position);
                this.instancedMesh.setMatrixAt(z * tileDim + x, this.dummy.matrix);
            }
        } // make it grid

        this.add(io);

        // actions section
        this.actions = Array.from(
            {
                length: 5000
            },
            () => {
                let action = (delay) => {
                    //console.log("action started");
                    let getFreeLetterIndex = () => {
                        let letterIndex = Math.floor(Math.random() * this.finals.length);
                        if (!this.finals[letterIndex].inAction) {
                            return letterIndex;
                        } else {
                            return getFreeLetterIndex();
                        }
                    };

                    let freeLetterIndex = getFreeLetterIndex();
                    let freeLetter = this.finals[freeLetterIndex];
                    let height = 30;
                    let m = freeLetter.mediators;
                    let v = m.v;
                    let v2 = m.v2;

                    v2.random()
                        .multiplyScalar(0.5)
                        .addScalar(0.5)
                        .multiplyScalar(Math.PI * 3 * Math.sign(Math.random() - 0.5));

                    let tween = new Tween({
                        val: 0
                    })
                        .to(
                            {
                                val: 1
                            },
                            10000
                        )
                        .delay(delay)
                        .onStart(() => {
                            freeLetter.inAction = true;
                        })
                        .onUpdate((val) => {
                            v.lerpVectors(v2, freeLetter.rot, val.val);
                            freeLetter.dummy.rotation.set(v.x, v.y, v.z);
                            freeLetter.dummy.position.copy(freeLetter.pos);
                            freeLetter.dummy.position.y = THREE.MathUtils.lerp(
                                height,
                                freeLetter.y,
                                val.val
                            );
                            freeLetter.dummy.updateMatrix();
                            io.setMatrixAt(freeLetterIndex, freeLetter.dummy.matrix);
                        })
                        .onComplete(() => {
                            freeLetter.inAction = false;
                            action(Math.random() * 10000);
                        });
                    tween.start();
                };
                return action;
            }
        ); // actions section

        //console.log(this.actions)
    }
}



// let textTerrain = new TextTerrain(renderer.capabilities.getMaxAnisotropy());
// scene.add(textTerrain);
// textTerrain.actions.forEach((action) => {
//     action((Math.random() * 0.9 + 0.1) * 10000);
// }); // start the actions

