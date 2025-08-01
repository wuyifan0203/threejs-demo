/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2025-08-01 15:04:35
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-08-01 17:29:36
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
    MeshBasicMaterial,
    MeshLambertMaterial,
    MeshNormalMaterial,
    Object3D,
    Raycaster,
    TorusKnotGeometry,
    Vector3
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
    initDirectionLight
} from '../lib/tools/index.js';

Mesh.prototype.raycast = acceleratedRaycast;
BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;


window.onload = () => {
    init();
};

const ZPostive = new Vector3(0, 0, 1);
const ZNegative = new Vector3(0, 0, -1);
const raycast = new Raycaster();

const dummy = new Object3D();

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
    const mesh = new Mesh(baseGeometry, new MeshNormalMaterial());
    scene.add(mesh);

    const mockMesh = new Mesh(new TorusKnotGeometry(10, 3, 64, 8, 2, 3), new MeshLambertMaterial({ color: 0x156289, emissive: 0x072534, flatShading: true, side: 2 }));
    const wireFrameMesh = new Mesh(mockMesh.geometry, new MeshBasicMaterial({ color: '#ffffff', wireframe: true }));
    scene.add(wireFrameMesh);
    scene.add(mockMesh);

    const color = new Color(0x156289);
    console.log('color->: ', color);

    const params = { gridSize: 1, };

    const range = getRange(mockMesh);
    baseGeometry.scale(params.gridSize, params.gridSize, params.gridSize);
    const voxels = generate(range, mockMesh, params.gridSize);

    const voxelsMaterial = new MeshBasicMaterial({ vertexColors: true });
    const instanceMesh = new InstancedMesh(baseGeometry, voxelsMaterial, voxels.length);
    voxels.forEach((voxel, index) => {
        dummy.position.copy(voxel.position);
        dummy.updateMatrix();
        instanceMesh.setMatrixAt(index, dummy.matrix);
        instanceMesh.setColorAt(index, voxel.color);
    });
    instanceMesh.instanceMatrix.needsUpdate = true;
    instanceMesh.instanceColor.needsUpdate = true;
    scene.add(instanceMesh);


    function render() {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
    const gui = initGUI();
}
const worldBox = new Box3();
function getRange(mesh) {
    worldBox.makeEmpty();
    mesh.traverse((child) => {
        if (child?.isMesh) {
            child.geometry.computeBoundingBox();
            worldBox.expandByObject(child);
        }
    });

    return {
        min: worldBox.min,
        max: worldBox.max,
        center: worldBox.getCenter(new Vector3()),
        size: worldBox.getSize(new Vector3())
    }
}



function generate(range, mesh, gridSize) {
    const { size } = range;
    const count = new Vector3(
        Math.ceil(size.x / gridSize),
        Math.ceil(size.y / gridSize),
        Math.ceil(size.z / gridSize)
    );
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
                const intersection = intersectTest(point);
                if (intersection.length % 2 === 0 && intersection.length > 0) {
                    const color = getColor(intersection);
                    voxels.push({
                        position: new Vector3(x, y, z),
                        color,
                    })
                }
            }
        }
    }

    console.log('voxels: ', voxels);

    function intersectTest(point) {
        const intersection = [];
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
            [ZPostive, ZNegative].forEach((dir) => {
                raycast.ray.origin.copy(point);
                raycast.ray.direction.copy(dir);
                raycast.ray.applyMatrix4(inverseMatrix);
                const intersects = raycast.intersectObject(mesh);
                intersection.push(...intersects);
            })

        }
        return intersection;
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