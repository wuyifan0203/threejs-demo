/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-21 11:04:15
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-21 15:03:59
 * @FilePath: \threejs-demo\src\texture\uvTest.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { Float64BufferAttribute } from '../lib/three/Buffer.js';
import {
    Float32BufferAttribute,
    Mesh,
    Vector3,
    BufferGeometry,
    MeshNormalMaterial,
    Matrix4,
    MeshStandardMaterial,
    MeshPhysicalMaterial,
} from '../lib/three/three.module.js';
import {
    initOrbitControls,
    initProgress,
    initRenderer,
    initDirectionLight,
    initScene,
    resize,
    initAmbientLight,
    initOrthographicCamera,
    initLoader,
    imagePath
} from '../lib/tools/index.js';



window.onload = async () => {
    init()
}

function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    const camera = initOrthographicCamera(new Vector3(50, 50, 50));
    const loader = initLoader();

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    initAmbientLight(camera);
    const light = initDirectionLight();
    camera.add(light);

    const material = new MeshPhysicalMaterial();

    loader.load(`../../${imagePath}/others/uv_grid_opengl.jpg`, (texture) => {
        material.map = texture;
        material.needsUpdate = true; // 确保材质更新
    })

    const viewport0 = createViewPort(renderer, camera, material);
    const viewport1 = createViewPort1(renderer, camera, material);


    function render() {
        orbitControl.update();
        renderer.clear();
        light.position.copy(camera.position);
        viewport1.render();
        requestAnimationFrame(render);
    }
    render();
    resize(renderer, camera)
}

function createViewPort(renderer, camera, material) {
    const axis = [-2, - 1, 0, 1, 2];

    const position = [];
    const indices = [];
    const uvs = [];
    let offset = 0;

    axis.forEach((x) => {
        axis.forEach((y) => {
            addPlane(x, y, position, offset, indices, uvs);
            offset += 4;
        })
    })

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(position, 3));
    geometry.setIndex(indices);
    geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();


    const mesh = new Mesh(geometry,material);
    mesh.add(camera);



    return {
        render() {
            renderer.render(mesh, camera);
        }
    }

}

function createViewPort1(renderer, camera, material) {
    const position = [];
    const indices = [];
    const uvs = [];
    let offset = 0;
    addPlane(0, 0, position, offset, indices, uvs);

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(position, 3));
    geometry.setIndex(indices);
    geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();

    const mesh = new Mesh(geometry, material);
    mesh.add(camera);


    return {
        render() {
            renderer.render(mesh, camera);
        }
    }

}


// a-d  a->b->c->d
// |\|
// b-c
const span = 4;
const halfSpan = span / 2;
const [a, b, c, d] = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
const buffer = new Float64BufferAttribute([
    -halfSpan, halfSpan, 0,
    -halfSpan, -halfSpan, 0,
    halfSpan, -halfSpan, 0,
    halfSpan, halfSpan, 0
], 3);


const mat4 = new Matrix4();
function addPlane(x, y, position, offset, indices, uvs) {
    mat4.makeTranslation(x * span, y * span, 0);
    a.fromBufferAttribute(buffer, 0).applyMatrix4(mat4);
    b.fromBufferAttribute(buffer, 1).applyMatrix4(mat4);
    c.fromBufferAttribute(buffer, 2).applyMatrix4(mat4);
    d.fromBufferAttribute(buffer, 3).applyMatrix4(mat4);

    position.push(
        a.x, a.y, a.z,
        b.x, b.y, b.z,
        c.x, c.y, c.z,
        d.x, d.y, d.z,
    );

    indices.push(
        offset, offset + 1, offset + 2,
        offset + 2, offset + 3, offset
    );

    uvs.push(
        0, 1,  // 顶点 a
        0, 0,  // 顶点 b
        1, 0,  // 顶点 c
        1, 1   // 顶点 d
    );
}