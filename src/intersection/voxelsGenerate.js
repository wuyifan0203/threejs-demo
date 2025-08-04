/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2025-08-01 15:04:35
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-08-04 17:40:50
 * @FilePath: \threejs-demo\src\intersection\voxelsGenerate.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Box3,
    BufferGeometry,
    Color,
    InstancedMesh,
    Matrix4,
    Mesh,
    MeshLambertMaterial,
    Object3D,
    Raycaster,
    TorusKnotGeometry,
    Vector3,
    MathUtils
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
    disposeBoundsTree, acceleratedRaycast, computeBoundsTree
} from '../lib/other/three-mesh-bvh.js'
import {
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
    initAxesHelper,
    initOrbitControls,
    initScene,
    initGUI,
    resize,
    initAmbientLight,
    initDirectionLight,
} from '../lib/tools/index.js';
import { gsap } from '../lib/other/gsap.js'


Mesh.prototype.raycast = acceleratedRaycast;
BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;


window.onload = () => {
    init();
};

const { randFloat, randInt } = MathUtils;

const ZPostive = new Vector3(0, 0, 1);
const ZNegative = new Vector3(0, 0, -1);
const raycast = new Raycaster();

const dummy = new Object3D();
const dirArray = ['up', 'down'];

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera();
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const scene = initScene();
    initAmbientLight(scene);
    initAxesHelper(scene);
    initCustomGrid(scene);
    const light = initDirectionLight();
    light.position.set(100, 100, 100);
    scene.add(light);
    const controls = initOrbitControls(camera, renderer.domElement);

    const baseGeometry = new RoundedBoxGeometry(1, 1, 1, 5, 0.2);
    const mockMesh = new Mesh(new TorusKnotGeometry(10, 3, 64, 8, 2, 3), new MeshLambertMaterial({ color: 0x156289, emissive: 0x072534, flatShading: true, side: 2 }));
    const voxelsMaterial = new MeshLambertMaterial({});

    const params = {
        gridSize: 1,
        instanceMesh: new InstancedMesh(baseGeometry, voxelsMaterial, 0)
    };

    function generateVoxels(mesh) {
        const range = getRange(mesh, params.gridSize);
        if (range.count.x * range.count.y * range.count.z > 150000) {
            return alert('Grid Size can not be more than 150000')
        }
        params.instanceMesh.removeFromParent();
        params.instanceMesh.dispose();
        params.instanceMesh.parent = null;
        params.instanceMesh.geometry.dispose();
        params.instanceMesh.material.dispose();

        const voxels = generate(range, mesh, params.gridSize);
        params.instanceMesh = new InstancedMesh(baseGeometry, voxelsMaterial, voxels.length);
        scene.add(params.instanceMesh);

        const timeLine = gsap.timeline();
        const startPos = new Vector3();

        for (let index = 0, l = voxels.length; index < l; index++) {
            const { position, color } = voxels[index];
            startPos.set(randFloat(30, 50) * randInt(0, 1), randFloat(30, 50) * randInt(0, 1), position.z);

            timeLine.to(startPos, {
                x: position.x,
                y: position.y,
                z: position.z,
                duration: 0.2,
                ease: 'power2.out',
                onUpdate: () => {
                    dummy.position.set(startPos.x, startPos.y, startPos.z);
                    dummy.scale.set(params.gridSize, params.gridSize, params.gridSize);
                    dummy.updateMatrix();

                    params.instanceMesh.setMatrixAt(index, dummy.matrix);
                    params.instanceMesh.setColorAt(index, color);
                    params.instanceMesh.instanceMatrix.needsUpdate = true;
                    params.instanceMesh.instanceColor.needsUpdate = true;
                }
            }, index * 0.001); // 关键：每个实例延迟启动时间（按 index 控制）
        }
    }


    generateVoxels(mockMesh);

    let angle = 0;
    function render() {
        controls.update();
        params.instanceMesh.rotation.set(0, 0, angle += 0.02);
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
    const gui = initGUI();
    gui.add(params, 'gridSize', 0.2, 10, 0.1).onFinishChange(() => {
        generateVoxels(mockMesh);
    })
}

const worldBox = new Box3();
function getRange(mesh, gridSize) {
    worldBox.makeEmpty();
    mesh.traverse((child) => {
        if (child?.isMesh) {
            child.geometry.computeBoundingBox();
            worldBox.expandByObject(child);
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

function generate(range, mesh, gridSize) {
    const { count } = range;

    const meshList = []
    mesh.traverse((child) => {
        if (child?.isMesh) {
            meshList.push(child);
            child.geometry.computeBoundsTree();
        }
    });


    const inverseMatrix = new Matrix4();
    const tmpBox = new Box3();

    const voxels = [];

    for (let ix = 0; ix < count.x; ix++) {
        for (let iy = 0; iy < count.y; iy++) {
            for (let iz = 0; iz < count.z; iz++) {
                const x = range.min.x + ix * gridSize;
                const y = range.min.y + iy * gridSize;
                const z = range.min.z + iz * gridSize;
                const point = new Vector3(x, y, z);
                const res = intersectTest(point);
                if (res.up % 2 === 1 && res.down % 2 === 1 && res.intersection.length > 0) {
                    const color = getColor(res.intersection);
                    voxels.push({
                        position: point,
                        color,
                    })
                }
            }
        }
    }

    console.log('voxels: ', voxels);

    function intersectTest(point) {
        const res = { intersection: [], up: -1, down: -1 };
        for (let i = 0; i < meshList.length; i++) {
            const mesh = meshList[i];
            mesh.updateWorldMatrix();
            tmpBox.copy(mesh.geometry.boundingBox);
            tmpBox.applyMatrix4(mesh.matrixWorld);
            // 先判断是否在box内,不在直接跳过
            if (!tmpBox.containsPoint(point)) {
                continue;
            }


            inverseMatrix.copy(mesh.matrixWorld).invert();
            [ZPostive, ZNegative].forEach((dir, i) => {
                raycast.ray.origin.copy(point);
                raycast.ray.direction.copy(dir);
                raycast.ray.applyMatrix4(inverseMatrix);
                const intersects = raycast.intersectObject(mesh);
                res[dirArray[i]] = intersects.length;
                res.intersection.push(...intersects);
            });
        }
        return res;
    }

    return voxels;
}

function getColor(intersection) {
    const result = new Color();
    intersection.sort((a, b) => (a.distance - b.distance));
    const { object, face, uv } = intersection[0];
    const materials = Array.isArray(object.material) ? intersection[0].object.material : [intersection[0].object.material];
    const { map, color } = materials[face.materialIndex];
    if (map !== null) {
        // TODO: 从纹理中获取颜色
        console.log(uv);
        result.copy(color);
    } else {
        result.copy(color);
    }
    return result;
}