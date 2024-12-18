/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-21 11:04:15
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-22 14:43:02
 * @FilePath: \threejs-demo\src\texture\uvTest.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { Float64BufferAttribute } from '../lib/custom/Buffer.js';
import {
    Float32BufferAttribute,
    Mesh,
    Vector3,
    BufferGeometry,
    Matrix3,
    Matrix4,
    MeshBasicMaterial,
    RepeatWrapping,
    MirroredRepeatWrapping,
    SRGBColorSpace,
} from 'three';
import {
    initOrbitControls,
    initRenderer,
    initScene,
    resize,
    initOrthographicCamera,
    initLoader,
    imagePath,
    matrixRender
} from '../lib/tools/index.js';

window.onload = async () => {
    init()
}

async function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;
    const camera = initOrthographicCamera(new Vector3(0, 0, 50));
    const orbitControl = initOrbitControls(camera, renderer.domElement);
    orbitControl.enableRotate = false;

    const loader = initLoader();
    const texture = await loader.loadAsync(`../../${imagePath}/others/uv_grid_opengl.jpg`);

    const viewport0 = createViewPort();
    const viewport1 = createViewPort1();
    const viewPort2 = createViewPort2();
    const viewPort3 = createViewPort3();


    const viewPorts = [
        [
            viewport0,
            viewport1,
        ],
        [
            viewPort2,
            viewPort3
        ]
    ]

    function render() {
        orbitControl.update();
        renderer.clear();
        matrixRender(viewPorts, renderer)
        requestAnimationFrame(render);
    }
    render();
    resize(renderer, camera);



    function createViewPort() {
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


        const mesh = new Mesh(geometry, new MeshBasicMaterial({ map: texture.clone() }));

        return {
            render() {
                renderer.render(mesh, camera);
            }
        }

    }

    function createViewPort1() {
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


        const mesh = new Mesh(geometry, new MeshBasicMaterial({ map: texture.clone() }));
        const currentTexture = mesh.material.map;
        const uvTransform = new Matrix3();
        uvTransform.scale(0.5, 1); // 将 UV 的 X 方向缩小一半，使比例为 1:1
        currentTexture.matrixAutoUpdate = false;
        currentTexture.matrix.copy(uvTransform);

        return {
            render() {
                renderer.render(mesh, camera);
            }
        }

    }

    function createViewPort2() {
        const position = [];
        const indices = [];
        const uvs = [];
        let offset = 0;
        addPlane(0, 0, position, offset, indices, uvs);
        const scene = initScene();

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(position, 3));
        geometry.setIndex(indices);
        geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
        geometry.computeVertexNormals();


        const meshA = new Mesh(geometry, new MeshBasicMaterial({ map: texture.clone() }));
        meshA.position.set(-4, 0, 0);
        const textureA = meshA.material.map;
        textureA.wrapS = RepeatWrapping;
        textureA.wrapT = RepeatWrapping;
        textureA.repeat.set(2, 2);
        textureA.needUpdate = true;

        const meshB = new Mesh(geometry, new MeshBasicMaterial({ map: texture.clone() }));
        meshB.position.set(4, 0, 0);
        const textureB = meshB.material.map;
        textureB.wrapS = MirroredRepeatWrapping;
        textureB.wrapT = MirroredRepeatWrapping;
        textureB.repeat.set(2, 2);
        textureB.needUpdate = true;

        scene.add(meshA);
        scene.add(meshB);

        return {
            render() {
                renderer.render(scene, camera);
            }
        }

    }

    function createViewPort3() {
        const position = [];
        const indices = [];
        const uvs = [];
        let offset = 0;
        addPlane(0, 0, position, offset, indices, uvs);
        const scene = initScene();

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(position, 3));
        geometry.setIndex(indices);
        geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
        geometry.computeVertexNormals();


        const mesh = new Mesh(geometry, new MeshBasicMaterial({ map: texture.clone() }));
        const textureA = mesh.material.map;
        textureA.colorSpace = SRGBColorSpace;
        textureA.needUpdate = true;
        scene.add(mesh);


        return {
            render() {
                renderer.render(scene, camera);
            }
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