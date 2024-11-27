/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-15 10:25:55
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-27 18:30:14
 * @FilePath: \threejs-demo\src\cannon\maze3D.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    Vector3,
    CanvasTexture,
    RepeatWrapping,
    MeshPhysicalMaterial,
    BoxGeometry,
    MeshNormalMaterial,
    PerspectiveCamera,
    CameraHelper,
    Box3,
    Object3D,
    WebGLRenderer
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrthographicCamera,
    initOrbitControls,
    initScene,
    initAmbientLight,
    initDirectionLight,
    HALF_PI,
    initAxesHelper,
    initLoader,
    imagePath,
    initClock,
    resize,
} from '../lib/tools/index.js';
import { MazeGeometry } from '../lib/custom/MazeGeometry.js';
import { AbstractPlayer } from '../lib/custom/AbstractPlayer.js';
import { PointerLockControls } from '../lib/three/PointerLockControls.js'


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
    const playerPosition = new Vector3(-117.5, 3, -117.5);


    const scene = initScene();
    initAmbientLight(scene);
    addLight(scene);

    initAxesHelper(scene);

    const eye = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 50);
    eye.lookAt(new Vector3(1, 0, 0));
    const eyeHelper = new CameraHelper(eye);

    const pointLockControl = new PointerLockControls(eye, document.body);

    const playerMesh = new Mesh(new BoxGeometry(2, 6, 2), new MeshNormalMaterial());
    playerMesh.geometry.computeBoundingBox();

    const player = new Player(pointLockControl, playerMesh);

    player.position.copy(playerPosition);
    player.shape.copy(playerMesh.geometry.boundingBox);
    player.add(playerMesh);
    player.add(eye);
    scene.add(eyeHelper);
    eyeHelper.layers.set(1);
    console.log(player);

    scene.add(player);

    const maze = await createMaze();
    maze.mesh.position.set(-130, 0, -130);
    scene.add(maze.mesh);

    const viewPort = useSideViewPort();

    resize(renderer, [eye], viewPort.resize)

    const blocker = document.getElementById('blocker');

    blocker.addEventListener('click', function () {
        pointLockControl.lock();
    });

    pointLockControl.addEventListener('lock', function () {
        blocker.style.display = 'none';
    });

    pointLockControl.addEventListener('unlock', function () {
        blocker.style.display = 'block';
    });

    window.addEventListener('keyup', (evt) => {
        player.keyUp(evt);
    })

    window.addEventListener('keydown', (evt) => {
        player.keyDown(evt);
    })

    function useSideViewPort() {
        const camera = initOrthographicCamera(new Vector3(-500, 500, 500));
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
        camera.position.set(0, 10, 10);
        camera.lookAt(0, 0, 0);

        playerMesh.add(camera);

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
    eye.layers.mask = layerMap.PLAYER;
    eyeHelper.layers.mask = layerMap.DEBUG;
    playerMesh.layers.mask = layerMap.DEBUG;

    const clock = initClock();
    let deltaTime = 0;
    function render() {
        deltaTime = clock.getDelta();

        renderer.render(scene, eye);
        eyeHelper.update();
        player.update(deltaTime);
        viewPort.render(scene, camera);
        requestAnimationFrame(render);

    }
    render();
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

    // mesh.material.forEach(m => m.wireframe = true);
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

class Player extends AbstractPlayer {
    constructor(controls, mesh) {
        super(new Box3());
        this.controls = controls;
        this.camera = controls.object;
        this.speed = 5;

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
        this.mesh = mesh;
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
        this.mesh.position.copy(this.camera.position);
        this.mesh.quaternion.copy(this.camera.quaternion);
    }

    _updateVelocity() {
        this.velocity.set(0, 0, 0);

        if (this.keyState.w) this.velocity.z += this.speed;
        if (this.keyState.s) this.velocity.z -= this.speed;
        if (this.keyState.a) this.velocity.x -= this.speed;
        if (this.keyState.d) this.velocity.x += this.speed;
    }

    _updatePosition(dt) {
        this.controls.moveForward(dt * this.velocity.z);
        this.controls.moveRight(dt * this.velocity.x);
    }
}