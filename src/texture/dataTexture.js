/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-02-07 15:12:03
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-02-11 14:51:39
 * @FilePath: \threejs-demo\src\texture\dataTexture.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    BoxGeometry,
    MeshNormalMaterial,
    PerspectiveCamera,
    Vector3,
    DirectionalLight,
    RepeatWrapping,
    Data3DTexture
} from 'three';
import {
    initRenderer,
    initCustomGrid,
    initAxesHelper,
    initScene,
    resize,
    initClock,
    initLoader,
    initAmbientLight,
    imagePath
} from '../lib/tools/index.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { AbstractPlayer } from '../lib/custom/AbstractPlayer.js';
import { SimplexNoise } from '../lib/custom/SimplexNoise.js'


const loader = initLoader();

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    const scene = initScene();
    initAxesHelper(scene);
    renderer.setClearColor(0xffffff);
    const grid = initCustomGrid(scene);
    grid.rotateX(Math.PI / 2);

    scene.add(new Mesh(new BoxGeometry(3, 3, 3), new MeshNormalMaterial()));

    const player = new Player();

    const world = new World();

    const clock = initClock();
    let deltaTime = 0;
    function render() {
        renderer.clear();
        deltaTime = clock.getDelta();
        player.update(deltaTime);
        renderer.render(world.scene, player.camera);
        renderer.render(scene, player.camera);


        requestAnimationFrame(render);
    }
    render();
    resize(renderer, player.camera);

}

class Player extends AbstractPlayer {
    constructor(parameters = {}) {
        super();
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.parameters = Object.assign({
            speed: 0.8
        }, parameters);
        const keyMap = this.keyMap = {
            'W': false,
            'A': false,
            'S': false,
            'D': false,
            'E': false,
            'Q': false,
            ' ': false,
            'SHIFT': false,
            'ArrowUp': false,
            'ArrowDown': false,
            'ArrowLeft': false,
            'ArrowRight': false,
            'Enter': false,
            'Escape': false,
            'Tab': false,
        };
        const controls = new PointerLockControls(this.camera, document.body);
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });

        document.addEventListener('click', function (e) {
            controls.lock();
            if (controls.isLocked) {
                e.preventDefault();
                // 1.点击屏幕
                // 2.放置或删除方块
                // 3.更新纹理
            }
        });

        document.addEventListener('keydown', function (e) {
            const key = e.key.toUpperCase();
            keyMap[key] = true;
        })

        document.addEventListener('keyup', function (e) {
            const key = e.key.toUpperCase();
            keyMap[key] = false;
        })
    }

    _updateDirection() {
        this.reset();
        if (this.keyMap.W) this.direction.z -= 1;
        if (this.keyMap.S) this.direction.z += 1;
        if (this.keyMap.A) this.direction.x -= 1;
        if (this.keyMap.D) this.direction.x += 1;
        if (this.keyMap.E) this.direction.y += 1;
        if (this.keyMap.Q) this.direction.y -= 1;

        this.direction.applyQuaternion(this.camera.quaternion).normalize();
    }

    _updateSpeed() {
        this.currentSpeed = this.keyMap.SHIFT ? this.parameters.speed * 3 : this.parameters.speed * 2;
    }

    _updatePosition(dt) {
        this.direction.multiplyScalar(this.currentSpeed * dt);
        if (this.direction.length() > 0) {

        }
        this.camera.position.add(this.direction);
    }
}

class World {
    constructor() {
        this.scene = initScene();
        this.size = new Vector3(512, 104, 512);
        this.center = new Vector3(0, 1, 0);

        this.resource = {
            cubeTexture: {},
            texture: {}
        }

        this.data = new Float32Array();

        this.init();
    }

    init() {
        this.initLights();
        this.initCubeTexture();
        this.initTexture();
        // this.initDataTexture();
        this.initDataTextureWorker();
    }

    initLights() {
        initAmbientLight(this.scene);

        const directionLight1 = new DirectionalLight(0xffffff, 0.35);
        directionLight1.position.set(150, 200, 50);
        directionLight1.castShadow = true;
        directionLight1.shadow.mapSize.width = 1024;
        directionLight1.shadow.mapSize.height = 1024;
        directionLight1.shadow.camera.left = -75;
        directionLight1.shadow.camera.right = 75;
        directionLight1.shadow.camera.top = 75;
        directionLight1.shadow.camera.bottom = -75;
        directionLight1.shadow.camera.near = 0.1;
        directionLight1.shadow.camera.far = 500;
        directionLight1.shadow.bias = -0.001;
        directionLight1.shadow.blurSamples = 8;
        directionLight1.shadow.radius = 4;
        this.scene.add(directionLight1);

        const directionLight2 = new DirectionalLight(0xffffff, 0.15);
        directionLight2.position.set(-50, 200, -150);
        this.scene.add(directionLight2);
    }

    initCubeTexture() {
        loader.setPath(`../../${imagePath}/skyBox/`);
        this.resource.cubeTexture['env'] = loader.load([
            "Box_Right.bmp",
            "Box_Left.bmp",
            "Box_Top.bmp",
            "Box_Bottom.bmp",
            "Box_Front.bmp",
            "Box_Back.bmp"
        ]);

        this.scene.background = this.resource.cubeTexture['env'];

        loader.setPath(`../../${imagePath}/starSkyBox/`);
        this.resource.cubeTexture['stars'] = loader.load([
            "StarSkyBoxRight.png",
            "StarSkyBoxLeft.png",
            "StarSkyBoxTop.png",
            "StarSkyBoxBottom.png",
            "StarSkyBoxFront.png",
            "StarSkyBoxBack.png",
        ]);

        this.scene.background = this.resource.cubeTexture['stars'];
    }

    initTexture() {
        loader.setPath(`../../${imagePath}/world/`);
        ['grass', 'dirt', 'stone', 'sand', 'gravel', 'leaf', 'wood', 'waterNormal', 'waterNormal2'].forEach((name) => {
            loader.load(`${name}.png`, (texture) => {
                this.resource.texture[name] = texture;
                texture.wrapS = RepeatWrapping;
                texture.wrapT = RepeatWrapping;
            })
        })
    }

    initDataTexture() {
        console.time('initDataTexture')
        const { x: sizeX, y: sizeY, z: sizeZ } = this.size;

        const n = new SimplexNoise(self.Math);
        const { round, sign, abs, random } = self.Math;
        const data = this.data;

        const cell = sizeX * sizeY;
        let height = 0;
        let factor = 0;
        const [boundZ, boundY, boundX] = [sizeZ - 1, sizeY - 1, sizeZ - 1];
        const [boundOffsetZ, boundOffsetY, boundOffsetX] = [sizeZ - 2, sizeY - 2, sizeZ - 2];
        for (let z = 0; z < sizeZ; z++) {
            for (let x = 0; x < sizeX; x++) {
                // 通过多次叠加不同频率的噪声来生成地形高度
                // for (let i = 0; i < 3; i++) {
                //     const iSquare = 2 ** i;
                //     height += 10 / iSquare * noise(z * 0.01 * iSquare, x * 0.01 * iSquare);
                // }
                // 优化一下 ，iSquare值恒等于1,2,4，只有x,z是变量，作为常数求累加

                height = 0.1 * n.noise(z * 0.01, x * 0.01) + 0.2 * n.noise(z * 0.02, x * 0.02) + 0.4 * n.noise(z * 0.04, x * 0.04);
                height = round(height);

                for (let y = 0; y < sizeY; y++) {
                    const idx = (z * cell + y * sizeX + x) * 4;
                    // 排除边界
                    if (!(z === 0 || z === boundZ || x === 0 || x === boundX || y === 0 || y === boundY)) {
                        // 通过多次叠加不同频率的噪声来生成洞穴因子
                        // let caveFactor = 0;
                        // for (let i = 0; i < 4; i++) {
                        //     caveFactor += 1 / (2 ** i) * noise.simplex3(x * 0.02 * (2 ** i), y * 0.02 * (2 ** i), z * 0.02 * (2 ** i));
                        // }
                        // 优化一下 ，iSquare值恒等于1,2,4，8,只有x,z是变量，作为常数求累加
                        let caveFactor = n.noise3d(x * 0.02, y * 0.02, z * 0.02) + 0.5 * n.noise3d(x * 0.04, y * 0.04, z * 0.04) + 0.25 * n.noise3d(x * 0.08, y * 0.08, z * 0.08) + 0.125 * n.noise3d(x * 0.16, y * 0.16, z * 0.16);
                        // 对洞穴因子进行处理，生成0或1,0表示当前地点没有洞穴（或是地面部分）,1 表示当前地点是洞穴的一部分（或有洞穴的存在）。
                        caveFactor = sign(round(caveFactor + 1.125));

                        // 根据地缘位置，对洞穴因子进行处理，
                        if (
                            (height < 0 && y >= 50 + height) ||
                            (y < 5 + abs(height)) ||
                            (x <= 1 || x >= boundOffsetX) ||
                            (z <= 1 || z >= boundOffsetZ)
                        ) {
                            caveFactor = 1;
                        }

                        if (y < 53 + height && y >= 50 + height) {
                            // 草地
                            factor = 0.5 + 0.5 * random()
                            data[idx] = 0;
                            data[idx + 1] = factor;
                            data[idx + 2] = 0;
                            data[idx + 3] = 1 * caveFactor;
                        } else if (y >= 43 + height && y <= 50 + height) {
                            // 泥土
                            factor = 0.75 + 0.5 * random()
                            data[idx] = (161 / 255) * factor;
                            data[idx + 1] = (103 / 255) * factor;
                            data[idx + 2] = (60 / 255) * factor;
                            data[idx + 3] = 2 * caveFactor;
                        } else if (y < 43 + height) {
                            // 石头
                            factor = 0.5 + 0.25 * random();
                            data[idx] = factor;
                            data[idx + 1] = factor;
                            data[idx + 2] = factor;
                            data[idx + 3] = 3 * caveFactor;
                        }
                        // 填充水，为空且上方不是空气
                        if (y < 50 && data[idx + 3] === 0 && data[idx + 3 - sizeX * 4] !== 0) {
                            factor = 0.5 + 0.25 * random();
                            data[idx] = factor * 0.25;
                            data[idx + 1] = factor * 0.5;
                            data[idx + 2] = factor;
                            data[idx + 3] = 4 * caveFactor;
                        }
                    }
                }
            }
        }
        console.timeEnd('initDataTexture')
    }

    initDataTextureWorker() {        
        const worker = new Worker('./terrainWorker.js', { type: 'module' });
        console.time('worker');
        worker.postMessage({
            size: this.size,
        })
        worker.onmessage = (e) => {
            console.timeEnd('worker');
            console.log('收到消息', e);
        }
    }
}