/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2025-08-01 15:04:35
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-08-07 15:13:40
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
    PlaneHelper,
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

const { clamp } = MathUtils;

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
    const planeHelper = new PlaneHelper(clipVoxel, 20);
    scene.add(planeHelper);

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

    let voxels = [];
    let range = null;
    let instanceMesh = new InstancedMesh(baseGeometry, voxelsMaterial, 0);

    const params = {
        model: 'TorusKnot',
        gridSize: 1,
        fadeIn() {
            animate(voxels.toReversed(), range.max.z, -1);
        },
        fadeOut() {
            animate(voxels, range.min.z, 1);
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

    const timeLine = gsap.timeline();

    function animate(voxels, start, sign) {
        for (let index = 0, l = voxels.length; index < l; index++) {
            const { position, color, z } = voxels[index];
            const tmpV = new Vector3();

            timeLine.to(position, {
                x: position.x,
                y: position.y,
                z: position.z,
                duration: 0.3,
                ease: 'power2.out',
                onUpdate: () => {
                    tmpV.z = start + sign * z * params.gridSize;
                    clipVoxel.setFromNormalAndCoplanarPoint(clipVoxel.normal, tmpV);
                    clipModel.setFromNormalAndCoplanarPoint(clipModel.normal, tmpV);

                    dummy.position.copy(position);
                    dummy.scale.set(params.gridSize, params.gridSize, params.gridSize);
                    dummy.updateMatrix();

                    instanceMesh.setMatrixAt(index, dummy.matrix);
                    instanceMesh.setColorAt(index, color);
                    instanceMesh.instanceMatrix.needsUpdate = true;
                    instanceMesh.instanceColor.needsUpdate = true;
                }
            }, index * 0.001); // 关键：每个实例延迟启动时间（按 index 控制）
        }
    }

    updateMesh(modelMap[params.model]);

    function render() {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
    const gui = initGUI();
    gui.add(params, 'model', Object.keys(modelMap)).onFinishChange(() => updateMesh(modelMap[params.model]));
    gui.add(params, 'gridSize', 0.2, 10, 0.1).onFinishChange(() => updateMesh(modelMap[params.model]));
    gui.add(params, 'fadeIn');
    gui.add(params, 'fadeOut');
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