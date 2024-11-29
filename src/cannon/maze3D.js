/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-15 10:25:55
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-29 11:16:59
 * @FilePath: \threejs-demo\src\cannon\maze3D.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    Vector3,
    CanvasTexture,
    RepeatWrapping,
    MeshPhysicalMaterial,
    CapsuleGeometry,
    MeshNormalMaterial,
    PerspectiveCamera,
    CameraHelper,
    Box3,
    Euler,
    WebGLRenderer
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrthographicCamera,
    initScene,
    initAmbientLight,
    initDirectionLight,
    HALF_PI,
    initAxesHelper,
    initLoader,
    imagePath,
    initClock,
    resize,
    initGUI,
    clamp,
    symbolFlag
} from '../lib/tools/index.js';
import { MazeGeometry } from '../lib/custom/MazeGeometry.js';
import { AbstractPlayer } from '../lib/custom/AbstractPlayer.js';
import { PointerLockControls } from '../lib/three/PointerLockControls.js'
import { Octree } from '../lib/three/Octree.js';
import { Capsule } from '../lib/three/Capsule.js';
import { OctreeHelper } from '../lib/three/OctreeHelper.js'

const layerMap = {
    ALL: 7,
    DEBUG: 4,
    PLAYER: 2
};

const loader = initLoader();
window.onload = () => {
    init();
};

async function init() {
    const renderer = initRenderer();
    const scene = initScene();
    initAmbientLight(scene);
    addLight(scene);

    initAxesHelper(scene);

    const octree = new Octree();

    const player = new Player(octree);

    const eyeHelper = new CameraHelper(player.eye);

    const maze = await createMaze();
    maze.mesh.position.set(-130, 0, -130);
    scene.add(maze.mesh);

    maze.mesh.updateMatrixWorld(true);
    console.log(maze.mesh.geometry.boundingBox.clone().applyMatrix4(maze.mesh.matrixWorld));
    octree.fromGraphNode(maze.mesh);

    const playerPosition = new Vector3(-117.5, 0, -117.5);

    player.position.copy(playerPosition);
    player.shape.translate(playerPosition);
    scene.add(eyeHelper);
    scene.add(player);

    const viewPort = useSideViewPort();

    resize(renderer, [player.eye], viewPort.resize)

    const blocker = document.getElementById('blocker');

    blocker.addEventListener('click', function () {
        player.controls.lock();
    });

    player.controls.addEventListener('lock', function () {
        blocker.style.display = 'none';
    });

    player.controls.addEventListener('unlock', function () {
        blocker.style.display = 'block';
    });

    window.addEventListener('keyup', (evt) => {
        player.keyUp(evt);
    })

    window.addEventListener('keydown', (evt) => {
        player.keyDown(evt);
        if (evt.key.toLowerCase() === 'q') collisionTest();
    })

    const octreeHelper = new OctreeHelper(octree);
    octreeHelper.visible = false;
    scene.add(octreeHelper);

    const gui = initGUI();
    gui.add(octreeHelper, 'visible').name('Octree Helper');
    gui.add({ text: 'press Q to test collision' }, 'text')

    function useSideViewPort() {
        const camera = initOrthographicCamera();
        camera.far = 100;
        camera.near = 0;
        camera.updateProjectionMatrix();
        camera.layers.mask = layerMap.DEBUG;

        const renderer = new WebGLRenderer({ antialias: true });
        const dom = document.createElement('div');
        document.body.appendChild(dom);
        dom.appendChild(renderer.domElement);

        dom.style.position = 'absolute';
        dom.style.top = '0px';

        resize();
        function resize() {
            renderer.setSize(window.innerWidth / 3, window.innerHeight / 3);
            camera.aspect = window.innerWidth / window.innerHeight;
        }
        camera.position.set(0, 10, -10);
        camera.lookAt(0, 0, 0);

        player.add(camera);

        camera.zoom = 2;
        return {
            resize,
            render(scene, camera) {
                renderer.render(scene, camera);
            }
        }
    }

    scene.traverse((obj) => {
        obj.layers && (obj.layers.mask = layerMap.ALL);
    });
    player.eye.layers.mask = layerMap.PLAYER;
    eyeHelper.layers.mask = layerMap.DEBUG;

    const clock = initClock();
    let deltaTime = 0;
    function render() {
        deltaTime = clock.getDelta();
        renderer.render(scene, player.eye);
        eyeHelper.update();
        player.update(deltaTime);
        viewPort.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    function collisionTest() {
        const result = octree.capsuleIntersect(player.shape);
        console.log(result);
    }
}

async function createMaze() {
    const cellSize = 5;
    const height = 10;

    const canvas = document.createElement('canvas');
    canvas.width = 265;
    canvas.height = 265;
    const ctx = canvas.getContext('2d');

    const geometry = new MazeGeometry(51, 51, cellSize);
    const maze = geometry.maze;
    maze.generate(1, 1);
    maze.grid.unshift(new Array(51).fill(0));
    maze.grid.push(new Array(51).fill(0));
    maze.grid.forEach((row) => {
        row.unshift(0);
        row.push(0);
    });
    geometry.generate(height);
    maze.draw(ctx);

    const { topMaterial, groundMaterial, wallMaterial } = await createMaterial();
    const mesh = new Mesh(geometry, [topMaterial, groundMaterial, wallMaterial]);

    mesh.receiveShadow = mesh.castShadow = true;

    const texture = new CanvasTexture(canvas);
    // material.map = texture;

    async function createMaterial() {
        loader.setPath(`../../${imagePath}/Stylized_Bricks/`);

        const wallColorMap = await loader.loadAsync(`baseColor.jpg`);
        const wallNormalMap = await loader.loadAsync(`normal.jpg`);
        const wallRoughnessMap = await loader.loadAsync(`roughness.jpg`);
        const wallAOMap = await loader.loadAsync(`ambientOcclusion.jpg`);

        loader.setPath(`../../${imagePath}/Stylized_Stone/`);
        const groundColorMap = await loader.loadAsync(`baseColor.jpg`);
        const groundNormalMap = await loader.loadAsync(`normal.jpg`);
        const groundRoughnessMap = await loader.loadAsync(`roughness.jpg`);
        const groundAOMap = await loader.loadAsync(`ambientOcclusion.jpg`);

        [wallColorMap, wallNormalMap, wallRoughnessMap, wallAOMap].forEach((texture) => {
            texture.wrapT = RepeatWrapping;
            texture.repeat.set(1, 2);
        });

        [groundColorMap, groundNormalMap, groundRoughnessMap, groundAOMap].forEach((texture) => {
            texture.wrapT = texture.wrapS = RepeatWrapping;
            texture.repeat.set(2, 2);
        });

        const groundMaterial = new MeshPhysicalMaterial({
            map: groundColorMap,
            normalMap: groundNormalMap,
            roughnessMap: groundRoughnessMap,
            aoMap: groundAOMap,
        });
        const wallMaterial = new MeshPhysicalMaterial({
            map: wallColorMap,
            normalMap: wallNormalMap,
            roughnessMap: wallRoughnessMap,
            aoMap: wallAOMap,
        });
        const topMaterial = new MeshPhysicalMaterial({
            map: wallColorMap,
            normalMap: wallNormalMap,
            roughnessMap: wallRoughnessMap,
            aoMap: wallAOMap,
        });

        return {
            wallMaterial,
            groundMaterial,
            topMaterial
        }
    }

    return {
        mesh
    }
}

function addLight(scene) {
    const light = initDirectionLight();
    light.position.set(-50, 200, 25);
    light.shadow.camera.left = -200;
    light.shadow.camera.right = 200;
    light.shadow.camera.top = 180;
    light.shadow.camera.bottom = -180;
    light.shadow.camera.far = 270;
    light.shadow.mapSize.height = 4096;
    light.shadow.mapSize.width = 4096;
    scene.add(light);
}

class Player extends Mesh {
    constructor(octree) {
        super(new CapsuleGeometry(1, 4), new MeshNormalMaterial());
        this.geometry.translate(0, 3, 0);

        this.layers.mask = layerMap.DEBUG;

        this.eye = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 50);
        this.eye.layers.mask = layerMap.PLAYER;
        this.eye.lookAt(new Vector3(1, 0, 0));

        this.controls = new PointerLockControls(this.eye, document.body);

        this.walkSpeed = 5;
        this.currentSpeed = 0;
        this.runSpeed = 8;
        this.acceleration = 2;
        this.shape = new Capsule(new Vector3(0, 0, 0), new Vector3(0, 6, 0), 1);

        this.deltaPos = new Vector3();
        this.octree = octree;
        this.velocity = new Vector3();

        this.keyMap = {
            w: 'w',
            a: 'a',
            s: 's',
            d: 'd',
            shift: 'shift'
        }

        this.keyState = {
            w: false,
            a: false,
            s: false,
            d: false,
            shift: false
        }
        this.euler = new Euler();
        this.add(this.eye);
        this.eye.position.set(0, 6, 0);

        this.direction = new Vector3();
    }

    keyDown(event) {
        const key = this.keyMap[event.key.toLowerCase()];
        this.keyState[key] = true;
    }

    keyUp(event) {
        const key = this.keyMap[event.key.toLowerCase()];
        this.keyState[key] = false;
    }

    update(dt) {
        this._updateVelocity();
        this._updatePosition(dt);
        // 修复位置
        this._fixedPosition();
    }

    _updateVelocity() {
        this.velocity.set(0, 0, 0);

        if (this.keyState.w) this.velocity.z += 1;
        if (this.keyState.s) this.velocity.z -= 1;
        if (this.keyState.a) this.velocity.x -= 1;
        if (this.keyState.d) this.velocity.x += 1;

        this.currentSpeed = clamp(this.currentSpeed + (symbolFlag(this.keyState.shift) * this.acceleration), this.walkSpeed, this.runSpeed)

        this.velocity.normalize().multiplyScalar(this.currentSpeed);
    }

    _updatePosition(dt) {
        this.deltaPos.copy(this.position);

        this.direction.setFromMatrixColumn(this.eye.matrix, 0);
        this.position.addScaledVector(this.direction, dt * this.velocity.x);
        this.direction.crossVectors(this.up, this.direction);
        this.position.addScaledVector(this.direction, dt * this.velocity.z);

        this.deltaPos.subVectors(this.position, this.deltaPos);
        this.shape.translate(this.deltaPos);
    }

    _fixedPosition() {
        const result = this.octree.capsuleIntersect(this.shape);
        if (result) {
            this.deltaPos.copy(result.normal).multiplyScalar(result.depth);
            this.position.add(this.deltaPos);
            this.shape.translate(this.deltaPos);
        }

    }
}