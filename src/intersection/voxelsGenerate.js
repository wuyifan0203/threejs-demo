/* eslint-disable no-use-before-define */
/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2025-08-01 15:04:35
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-08-08 16:37:24
 * @FilePath: \threejs-demo\src\intersection\voxelsGenerate.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Box3,
    BufferGeometry,
    Color,
    InstancedMesh,
    Mesh,
    MeshLambertMaterial,
    Object3D,
    Raycaster,
    TorusKnotGeometry,
    Vector3,
    MathUtils,
    Box3Helper,
    Plane,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry.js';
import {
    disposeBoundsTree, acceleratedRaycast, computeBoundsTree
} from '../lib/other/three-mesh-bvh.js'
import {
    initRenderer,
    initOrthographicCamera,
    initOrbitControls,
    initScene,
    initGUI,
    resize,
    initAmbientLight,
    initDirectionLight,
    initGroundPlane,
    initLoader,
    HALF_PI,
    Model_Path,
    DIRECTION,
} from '../lib/tools/index.js';
import { gsap } from '../lib/other/gsap.js'


Mesh.prototype.raycast = acceleratedRaycast;
BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;


window.onload = () => {
    init();
};

const { clamp, lerp } = MathUtils;

const raycast = new Raycaster();

const dummy = new Object3D();
const tmpBox = new Box3();
const direction = new Vector3();
const dirArray = Object.keys(DIRECTION);
const loader = initLoader();

function init() {
    const renderer = initRenderer();
    renderer.localClippingEnabled = true;

    const camera = initOrthographicCamera(new Vector3(0, -400, 300));
    camera.up.set(0, 0, 1);
    camera.zoom = 0.3;
    camera.updateProjectionMatrix();

    const scene = initScene();
    initAmbientLight(scene);
    const ground = initGroundPlane(scene);
    ground.position.z = -10;
    const light = initDirectionLight();
    light.position.set(100, 100, 100);
    scene.add(light);
    const controls = initOrbitControls(camera, renderer.domElement);

    const clipVoxel = new Plane(DIRECTION.NEGZ);
    const clipModel = new Plane(DIRECTION.POSZ);

    const baseGeometry = new RoundedBoxGeometry(1, 1, 1, 5, 0.2);
    const voxelsMaterial = new MeshLambertMaterial({
        clipShadows: true,
        clippingPlanes: [clipVoxel]
    });

    const modelMap = {
        TorusKnot: new Mesh(
            new TorusKnotGeometry(10, 3, 64, 8, 2, 3),
            new MeshLambertMaterial({
                color: 0x156289,
                emissive: 0x072534,
                flatShading: true,
                side: 2,
                clippingPlanes: [clipModel]
            })),
        Teapot: new Mesh(
            new TeapotGeometry(10).rotateX(HALF_PI),
            new MeshLambertMaterial({
                color: '#ffa504',
                emissive: '#895201',
                flatShading: true,
                side: 2,
                clippingPlanes: [clipModel]
            })),
        Duck: null,
        Watermelon: null
    }

    loader.load(`../../${Model_Path}/rubber_duck_toy/rubber_duck_toy_1k.gltf`, (res) => {
        modelMap.Duck = res.scene.children[0];
        modelMap.Duck.scale.set(100, 100, 100);
        modelMap.Duck.rotation.set(HALF_PI, 0, 0);
        modelMap.Duck.updateMatrixWorld(true);
        modelMap.Duck.traverse((child) => {
            if (child?.isMesh) {
                child.castShadow = true;
                child.geometry.computeBoundingBox();
                child.material.side = 2;
                child.material.clippingPlanes = [clipModel];
                child.updateMatrixWorld(true);
            }
        });
    });

    loader.load(`../../${Model_Path}/watermelon.glb`, (res) => {
        modelMap.Watermelon = res.scene.children[0];
        modelMap.Watermelon.scale.set(10, 10, 10);
        modelMap.Watermelon.rotation.set(HALF_PI, 0, 0);
        modelMap.Watermelon.updateMatrixWorld(true);
        modelMap.Watermelon.traverse((child) => {
            if (child?.isMesh) {
                child.castShadow = true;
                child.geometry.computeBoundingBox();
                child.material.side = 2;
                child.material.clippingPlanes = [clipModel];
                child.updateMatrixWorld(true);
            }
        });
    })

    let voxels = [];
    let range = null;
    let instanceMesh = new InstancedMesh(baseGeometry, voxelsMaterial, 0);

    const params = {
        model: 'TorusKnot',
        gridSize: 1,
        fadeIn() {
            // Model -> Voxel
            fadeInBtn.disable(true);
            fadeOutBtn.enable(true);
            clipVoxel.setFromNormalAndCoplanarPoint(clipVoxel.normal, new Vector3(0, 0, range.min.z));
            clipModel.setFromNormalAndCoplanarPoint(clipModel.normal, new Vector3(0, 0, range.min.z));
            animateVoxels(voxels, 1);
        },
        fadeOut() {
            // Voxel -> Model
            fadeInBtn.enable(true);
            fadeOutBtn.disable(true);
            clipVoxel.setFromNormalAndCoplanarPoint(clipVoxel.normal, new Vector3(0, 0, range.max.z));
            clipModel.setFromNormalAndCoplanarPoint(clipModel.normal, new Vector3(0, 0, range.max.z));
            animateVoxels(voxels.toReversed(), -1);
        },
    };

    let lastModel = null;
    function updateMesh(mesh) {
        scene.remove(lastModel);
        range = getRange(mesh, params.gridSize);
        instanceMesh.removeFromParent();
        instanceMesh.dispose();
        instanceMesh.parent = null;
        instanceMesh.geometry.dispose();
        instanceMesh.material.dispose();
        lastModel = mesh;
        lastModel.castShadow = true;

        voxels = generateVoxels(range, mesh, params.gridSize);
        instanceMesh = new InstancedMesh(baseGeometry, voxelsMaterial, voxels.length);
        instanceMesh.instanceMatrix.array.fill(0);
        instanceMesh.castShadow = true;
        scene.add(instanceMesh);
        scene.add(mesh);
    }

    function animateVoxels(voxels, sign) {
        const startPositions = [];
        const endPositions = [];

        const rangeSize = range.size.length() * 0.5; // 模型范围的一半，用来生成随机范围

        for (let i = 0; i < voxels.length; i++) {
            const { position } = voxels[i];
            const randomPos = new Vector3(
                position.x + (Math.random() - 0.5) * rangeSize * 5,
                position.y + (Math.random() - 0.5) * rangeSize * 5,
                position.z + (Math.random() - 0.5) * rangeSize * 5
            );
            if (sign === 1) {
                // fadeIn: 随机起点 → position
                startPositions.push(randomPos);
                endPositions.push(position.clone());
            } else {
                // fadeOut: position → 随机终点
                startPositions.push(position.clone());
                endPositions.push(randomPos);
            }
        }

        let progress = 0;
        const tl = gsap.timeline();

        const [min, max] = [sign === 1 ? range.min.z : range.max.z, sign === 1 ? range.max.z : range.min.z]
        const tmpV = new Vector3();

        const scalefactor = sign === 1 ? [0, 1] : [1, 0];

        tl.to({ t: 0 }, {
            t: 1,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: function () {
                progress = this.targets()[0].t;

                // 平面位置插值
                const planeZ = lerp(min, max, progress);
                clipVoxel.setFromNormalAndCoplanarPoint(clipVoxel.normal, new Vector3(0, 0, planeZ));
                clipModel.setFromNormalAndCoplanarPoint(clipModel.normal, new Vector3(0, 0, planeZ));

                const scale = lerp(scalefactor[0], scalefactor[1], progress) * params.gridSize;

                // 更新实例矩阵
                for (let i = 0; i < voxels.length; i++) {
                    const { color } = voxels[i];
                    tmpV.lerpVectors(startPositions[i], endPositions[i], progress);

                    dummy.position.copy(tmpV);
                    dummy.scale.set(scale, scale, scale);
                    dummy.updateMatrix();

                    instanceMesh.setMatrixAt(i, dummy.matrix);
                    instanceMesh.setColorAt(i, color);
                }

                instanceMesh.instanceMatrix.needsUpdate = true;
                instanceMesh.instanceColor.needsUpdate = true;
            }
        });
    }

    updateMesh(modelMap[params.model]);

    clipVoxel.setFromNormalAndCoplanarPoint(clipVoxel.normal, new Vector3(0, 0, range.min.z));
    clipModel.setFromNormalAndCoplanarPoint(clipModel.normal, new Vector3(0, 0, range.min.z));

    function render() {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
    const gui = initGUI();
    gui.add(params, 'model', Object.keys(modelMap)).onFinishChange(() => {
        fadeInBtn.enable(true);
        fadeOutBtn.disable(true);
        updateMesh(modelMap[params.model]);
        clipVoxel.setFromNormalAndCoplanarPoint(clipVoxel.normal, new Vector3(0, 0, range.min.z));
        clipModel.setFromNormalAndCoplanarPoint(clipModel.normal, new Vector3(0, 0, range.min.z));
    });
    gui.add(params, 'gridSize', 0.2, 10, 0.1).onFinishChange(() => {
        fadeInBtn.enable(true);
        fadeOutBtn.disable(true);
        updateMesh(modelMap[params.model]);
        clipVoxel.setFromNormalAndCoplanarPoint(clipVoxel.normal, new Vector3(0, 0, range.min.z));
        clipModel.setFromNormalAndCoplanarPoint(clipModel.normal, new Vector3(0, 0, range.min.z));
    });
    const fadeInBtn = gui.add(params, 'fadeIn');
    const fadeOutBtn = gui.add(params, 'fadeOut').disable(true);

}


const worldBox = new Box3();
const boundingBox = new Box3Helper(worldBox);
function getRange(mesh, gridSize) {
    worldBox.makeEmpty();
    mesh.traverse((child) => {
        if (child?.isMesh) {
            child.geometry.computeBoundingBox();
            child.updateMatrixWorld(true);

            if (child.geometry.boundingBox !== null) {
                tmpBox.copy(child.geometry.boundingBox);
                tmpBox.applyMatrix4(child.matrixWorld);
                worldBox.union(tmpBox);
            }
        }
    });
    const size = worldBox.getSize(new Vector3());
    const count = new Vector3(
        Math.ceil(size.x / gridSize),
        Math.ceil(size.y / gridSize),
        Math.ceil(size.z / gridSize)
    );

    return {
        min: worldBox.min,
        max: worldBox.max,
        center: worldBox.getCenter(new Vector3()),
        size,
        count,
    }
}

function generateVoxels(range, mesh, gridSize) {
    const { count, min } = range;
    const meshList = []
    mesh.traverse((child) => {
        if (child?.isMesh) {
            meshList.push(child);
            child.geometry.computeBoundsTree();
        }
    });

    const voxels = [];

    for (let iz = 0, dz = 0; iz < count.z; iz++, dz = iz * gridSize) {
        for (let ix = 0, dx = 0; ix < count.x; ix++, dx = ix * gridSize) {
            for (let iy = 0, dy = 0; iy < count.y; iy++, dy = iy * gridSize) {
                const x = min.x + dx;
                const y = min.y + dy;
                const z = min.z + dz;
                const point = new Vector3(x, y, z);
                const res = intersectTest(point);
                const isIntersect = dirArray.some((dir) => res[dir] % 2 === 1);
                res.intersection.sort((a, b) => (Math.abs(a.distance) - Math.abs(b.distance)));

                const firstIntersect = res.intersection[0];
                if (res.intersection.length > 0 && isIntersect && Math.abs(firstIntersect.distance) < gridSize) {
                    voxels.push({
                        position: point,
                        color: getColor(firstIntersect),
                        z: iz
                    })
                }
            }
        }
    }

    function intersectTest(point) {
        const res = { intersection: [] };
        for (let i = 0; i < meshList.length; i++) {
            const mesh = meshList[i];
            tmpBox.copy(mesh.geometry.boundingBox);
            tmpBox.applyMatrix4(mesh.matrixWorld);
            boundingBox.box.copy(tmpBox.clone());
            // 先判断是否在box内,不在直接跳过
            if (!tmpBox.containsPoint(point)) {
                continue;
            }

            dirArray.forEach((dir) => {
                direction.copy(DIRECTION[dir]);
                raycast.ray.origin.copy(point);
                raycast.ray.direction.copy(direction);
                const intersects = raycast.intersectObject(mesh, true);
                res[dir] = intersects.length;
                res.intersection.push(...intersects);
            });
        }
        return res;
    }

    return voxels;
}

function getColor(intersection) {
    const result = new Color();
    const { object, face, uv } = intersection;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    const material = materials[face.materialIndex];
    if (material.map !== null) {
        const map = material.map;
        const image = map.image;
        let textureContext = material.userData?.cacheTextureContext;
        if (textureContext === undefined) {
            const textureCanvas = document.createElement('canvas');
            textureContext = textureCanvas.getContext('2d', { willReadFrequently: true });

            textureCanvas.width = image.width;
            textureCanvas.height = image.height;
            textureContext.drawImage(image, 0, 0);
            material.userData.cacheTextureContext = textureContext;
        }

        const u = clamp(uv.x, 0, 1 - 1 / image.width);
        const v = clamp(map.flipY ? 1 - uv.y : uv.y, 0, 1 - 1 / image.height);

        const pixel = textureContext.getImageData(Math.floor(u * image.width), Math.floor(v * image.height), 1, 1).data;
        result.setRGB(pixel[0] / 255, pixel[1] / 255, pixel[2] / 255);
    } else {
        result.copy(material.color);
    }
    return result;
}