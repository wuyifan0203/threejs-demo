/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-04-11 14:39:10
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-04-12 10:21:50
 * @FilePath: /threejs-demo/src/intersection/useRaycaster.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Float32BufferAttribute,
    SphereGeometry,
    TorusKnotGeometry,
    MeshStandardMaterial,
    Mesh,
    Vector3,
    Ray,
    Triangle,
    Box3
} from '../lib/three/three.module.js';
import {
    initAmbientLight,
    initCustomGrid,
    initDirectionLight,
    initGUI,
    initOrbitControls,
    initOrthographicCamera,
    initRenderer,
    initScene
} from '../lib/tools/common.js';

window.onload = function () {
    init();
}

function init() {
    const scene = initScene();
    const camera = initOrthographicCamera(new Vector3(0, 0, 200));
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const renderer = initRenderer();
    const light = initDirectionLight();
    light.position.set(0, 100, 100);

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const countDom = document.getElementById('count');

    initCustomGrid(scene, 50, 50)

    orbitControls.addEventListener('change', render);

    scene.add(light);
    initAmbientLight(scene);

    const sphere = createSphere(4);

    const torusKnot = createTorusKnot();

    countDom.innerText = sphere.geometry.getIndex().count + torusKnot.geometry.getIndex().count;

    scene.add(sphere);
    scene.add(torusKnot);

    function render() {
        renderer.render(scene, camera);
    }

    render();

    const gui = initGUI();
    gui.add(sphere.material, 'wireframe').name('Sphere wireframe').onChange(render);
    gui.add(torusKnot.material, 'wireframe').name('TorusKnot wireframe').onChange(render);

    getInsertIndex(sphere, torusKnot)


}

function createSphere(radius) {
    const geometry = new SphereGeometry(radius, 32, 32);
    const colors = new Array(geometry.getIndex().count * 3);
    for (let i = 0; i < colors.length; i++) {
        colors[i] = 1.0;
    }
    const colorBuffer = new Float32BufferAttribute(colors, 3);
    geometry.setAttribute('color', colorBuffer);
    const mesh = new Mesh(geometry, new MeshStandardMaterial({ vertexColors: true }));

    return mesh;
}

function createTorusKnot() {
    const geometry = new TorusKnotGeometry(5, 2, 100, 16);
    const colors = new Array(geometry.getIndex().count * 3);
    for (let i = 0; i < colors.length; i++) {
        colors[i] = 0.5;
    }
    const colorBuffer = new Float32BufferAttribute(colors, 3);
    geometry.setAttribute('color', colorBuffer);
    const mesh = new Mesh(geometry, new MeshStandardMaterial({ vertexColors: true }));
    return mesh;
}

const _edge1 = new Vector3();
const _edge2 = new Vector3();
const _normal = new Vector3();
const _diff = new Vector3();

Ray.prototype.intersectsTriangle = function (triangle) {
    _edge1.subVectors(triangle.b, triangle.a);
    _edge2.subVectors(triangle.c, triangle.a);
    _normal.crossVectors(_edge1, _edge2);

    // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
    // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
    //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
    //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
    //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)

    let DdN = this.direction.dot(_normal);
    let sign;

    if (DdN > 0) {
        sign = 1;
    } else if (DdN < 0) {
        sign = -1;
        DdN = -DdN;
    } else {
        return false;
    }

    _diff.subVectors(this.origin, triangle.a);
    const DdQxE2 = sign * this.direction.dot(_edge2.crossVectors(_diff, _edge2));

    // b1 < 0, no intersection
    if (DdQxE2 < 0) {
        return false;
    }

    const DdE1xQ = sign * this.direction.dot(_edge1.cross(_diff));

    // b2 < 0, no intersection
    if (DdE1xQ < 0) {
        return false;
    }

    // b1+b2 > 1, no intersection
    if (DdQxE2 + DdE1xQ > DdN) {
        return false;
    }

    // Line intersects triangle, check if ray does.
    const QdN = -sign * _diff.dot(_normal);

    // t < 0, no intersection
    if (QdN < 0) {
        return false;
    }

    return true;
}

const ray = new Ray();
const _triangle = new Triangle();

const _boxA = new Box3();
const _boxB = new Box3();
const center = new Vector3(1 / 3, 1 / 3, 1 / 3);

function getInsertIndex(objectA, objectB) {
    let geometryA = objectA.geometry.clone();
    let geometryB = objectB.geometry.clone();

    geometryA.applyMatrix4(objectA.matrixWorld);
    geometryB.applyMatrix4(objectB.matrixWorld);

    console.log(geometryA);

    const positionA = geometryA.getAttribute('position');
    const positionB = geometryB.getAttribute('position');

    const indexA = geometryA.getIndex();
    const indexB = geometryB.getIndex();

    console.log(indexA.count);

    for (let j = 0; j < indexA.count; j = j + 3) {
        _triangle.setFromAttributeAndIndices(positionA, j, j + 1, j + 2);
        _boxA.setFromPoints([_triangle.a, _triangle.b, _triangle.c]);

        // for (let k = 0; k < indexB.count; k = k + 3) {
            //     _triangle.setFromAttributeAndIndices(positionB, k, k + 1, k + 2);
            //     _boxB.setFromPoints([_triangle.a, _triangle.b, _triangle.c]);

            //     if(_boxA.intersectsBox(_boxB)){

            //         // console.log('intersects',j , k );
            //     }
            // console.log(j + k);
        // }
    }


}

