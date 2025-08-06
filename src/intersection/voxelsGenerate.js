/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2025-08-01 15:04:35
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-08-06 17:31:26
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
    MathUtils,
    Box3Helper,
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
    DIRECTION
} from '../lib/tools/index.js';
import { gsap } from '../lib/other/gsap.js'


Mesh.prototype.raycast = acceleratedRaycast;
BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;


window.onload = () => {
    init();
};

const { randFloat, randInt } = MathUtils;

const raycast = new Raycaster();

const dummy = new Object3D();
const tmpBox = new Box3();
const direction = new Vector3();
const dirArray = Object.keys(DIRECTION);
const loader = initLoader();


function init() {
    const renderer = initRenderer();
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

    const baseGeometry = new RoundedBoxGeometry(1, 1, 1, 5, 0.2);
    const voxelsMaterial = new MeshLambertMaterial({});

    const modelMap = {
        TorusKnot: new Mesh(new TorusKnotGeometry(10, 3, 64, 8, 2, 3), new MeshLambertMaterial({ color: 0x156289, emissive: 0x072534, flatShading: true, side: 2 })),
        Teapot: new Mesh(new TeapotGeometry(10).rotateX(HALF_PI), new MeshLambertMaterial({ color: '#ffa504', emissive: '#895201', flatShading: true, side: 2 })),
        Duck: null,
    }

    loader.load(`../../${Model_Path}/rubber_duck_toy/rubber_duck_toy_1k.gltf`, (res) => {
        modelMap.Duck = res.scene.children[0];
        modelMap.Duck.scale.set(100, 100, 100);
        modelMap.Duck.rotation.set(HALF_PI, 0, 0);


        scene.add(modelMap.Duck);

        console.log('modelMap: ', modelMap);
    });



    const params = {
        model: 'TorusKnot',
        gridSize: 3,
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
        params.instanceMesh.instanceMatrix.array.fill(0);
        params.instanceMesh.castShadow = true;
        scene.add(params.instanceMesh);

        const timeLine = gsap.timeline();

        for (let index = 0, l = voxels.length; index < l; index++) {
            const { position, color } = voxels[index];
            // ✅ 每个 voxel 都有自己的 startPos
            const startPos = new Vector3(
                randFloat(30, 50) * randInt(0, 1),
                randFloat(30, 50) * randInt(0, 1),
                position.z
            );

            const animatedPos = startPos.clone(); // ✅ 用于动画控制的中间变量

            timeLine.to(animatedPos, {
                x: position.x,
                y: position.y,
                z: position.z,
                duration: 0.3,
                ease: 'power2.out',
                onUpdate: () => {
                    dummy.position.copy(animatedPos);
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


    generateVoxels(modelMap[params.model]);


    function render() {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
    const gui = initGUI();
    gui.add(params, 'model', Object.keys(modelMap)).onFinishChange(() => {
        generateVoxels(modelMap[params.model]);
    })

    gui.add(params, 'gridSize', 0.2, 10, 0.1).onFinishChange(() => {
        generateVoxels(modelMap[params.model]);
    })

    scene.add(boundingBox);

}


const worldBox = new Box3();
const boundingBox = new Box3Helper(worldBox);
function getRange(mesh, gridSize) {
    worldBox.makeEmpty();

    mesh.traverse((child) => {
        if (child?.isMesh) {
            child.geometry.computeBoundingBox();
            child.updateWorldMatrix();
            tmpBox.copy(child.geometry.boundingBox);
            tmpBox.applyMatrix4(child.matrixWorld);
            worldBox.union(tmpBox);
        }
    });
    const size = worldBox.getSize(new Vector3());
    console.log('worldBox: ', worldBox);
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
    console.log('range: ', range);

    const meshList = []
    mesh.traverse((child) => {
        if (child?.isMesh) {
            meshList.push(child);
            child.geometry.computeBoundsTree();
        }
    });


    const inverseMatrix = new Matrix4();

    const voxels = [];
    let i = 0

    for (let iz = 0; iz < count.z; iz++) {
        for (let ix = 0; ix < count.x; ix++) {
            for (let iy = 0; iy < count.y; iy++) {
                i++;
                const x = range.min.x + ix * gridSize;
                const y = range.min.y + iy * gridSize;
                const z = range.min.z + iz * gridSize;
                const point = new Vector3(x, y, z);
                const res = intersectTest(point);
                console.log('res: ', res);
                if (res.POSZ % 2 === 1 && res.NEGZ % 2 === 1 && res.intersection.length > 0) {
                    const color = getColor(res.intersection);
                    voxels.push({
                        position: point,
                        color,
                    })
                }
            }
        }
    }
    console.log('i: ', i, 'total', count.x * count.y * count.z);


    console.log('voxels: ', voxels);

    function intersectTest(point) {
        const res = { intersection: [], up: -1, down: -1 };
        for (let i = 0; i < meshList.length; i++) {
            const mesh = meshList[i];
            tmpBox.copy(mesh.geometry.boundingBox);
            tmpBox.applyMatrix4(mesh.matrixWorld);
            boundingBox.box.copy(tmpBox.clone());
            // 先判断是否在box内,不在直接跳过
            if (!tmpBox.containsPoint(point)) {
                console.log('不在box内');
                continue;
            }


            inverseMatrix.copy(mesh.matrixWorld).invert();
            dirArray.forEach((dir) => {
                direction.copy(DIRECTION[dir]);
                raycast.ray.origin.copy(point);
                raycast.ray.direction.copy(direction);
                raycast.ray.applyMatrix4(inverseMatrix);
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
    intersection.sort((a, b) => (a.distance - b.distance));
    const { object, face, uv } = intersection[0];
    const materials = Array.isArray(object.material) ? intersection[0].object.material : [intersection[0].object.material];
    const { map, color } = materials[face.materialIndex];
    if (map !== null) {
        // TODO: 从纹理中获取颜色
        result.copy(color);
    } else {
        result.copy(color);
    }
    return result;
}