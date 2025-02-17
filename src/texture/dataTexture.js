/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-02-07 15:12:03
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-02-14 11:13:27
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
    Data3DTexture,
    FloatType,
    NearestFilter,
    MeshBasicMaterial,
    InstancedMesh,
    Matrix4
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
        this.size = new Vector3(50, 52, 50);
        this.center = new Vector3(0, 1, 0);

        this.resource = {
            cubeTexture: {},
            texture: {},
            dataTexture: {}
        }

        this.data = new Float32Array();

        this.init();
    }

    init() {
        this.initLights();
        this.initCubeTexture();
        this.initTexture();
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

    initDataTextureWorker() {
        console.log('worker');
        const terrainWorker = new Worker('./terrainWorker.js', { type: 'module' });
        console.time('worker');
        terrainWorker.postMessage({
            size: this.size,
        })
        terrainWorker.onmessage = (e) => {
            console.timeEnd('worker');
            console.log('收到消息', e);
            this.data = e.data;
            const dataTexture = new Data3DTexture(e.data, this.size.x, this.size.y, this.size.z);
            dataTexture.type = FloatType;
            dataTexture.minFilter = dataTexture.magFilter = NearestFilter;
            dataTexture.needsUpdate = true;
            this.resource.dataTexture['terrain'] = dataTexture;

            this.buildPreview();
        }
    }

    buildPreview() {
        console.log(888);
        const count = new Array(9).fill(0);
        const cell = this.size.x * this.size.y
        for (let z = 0; z < this.size.z; z++) {
            for (let x = 0; x < this.size.x; x++) {
                for (let y = 0; y < this.size.y; y++) {
                    const idx = (z * cell + y * this.size.x + x) * 4 + 3
                    count[this.data[idx]]++;
                }
            }
        }
        console.log('count: ', count);

        const geometry = new BoxGeometry(2, 2, 2, 1, 1, 1);
        const { grass, dirt, stone, sand, gravel, leaf, wood, waterNormal, waterNormal2 } = this.resource.texture;
        const materials = [grass, dirt, stone, waterNormal, wood, leaf, sand, gravel].map((map) => new MeshBasicMaterial({ map }));

        const meshes = [];
        for (let i = 1; i < count.length; i++) {
            const mesh = new InstancedMesh(geometry, new MeshBasicMaterial(), count[i]);
            meshes.push(mesh);

        }
        this.scene.add(meshes[0]);
        const mat = new Matrix4();

        for (let z = 0; z < this.size.z; z++) {
            for (let x = 0; x < this.size.x; x++) {
                for (let y = 0; y < this.size.y; y++) {
                    const idx = (z * cell + y * this.size.x + x) * 4;
                    if (this.data[idx + 3] === 1) {
                        const [x, y, z] = [this.data[idx], this.data[idx + 1], this.data[idx + 2]];
                        meshes[0].setMatrixAt(idx / 4, mat.makeTranslation(x * 2, y * 2, z * 2));
                    }
                }
            }
        }


    }
}