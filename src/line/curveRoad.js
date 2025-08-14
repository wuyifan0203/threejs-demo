/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-01-15 10:57:53
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-08-11 11:32:01
 * @FilePath: \threejs-demo\src\line\curveRoad.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    Vector3,
    MeshBasicMaterial,
    CatmullRomCurve3,
    BufferGeometry,
    BufferAttribute,
    RepeatWrapping,
    CameraHelper,
    PerspectiveCamera,
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initAxesHelper,
    initOrbitControls,
    initScene,
    resize,
    dataToVec3,
    initLoader,
    Image_Path,
    Model_Path,
    initDirectionLight,
    initAmbientLight,
    initClock,
    initGUI,
    HALF_PI,
    initCoordinates,
} from '../lib/tools/index.js';

const curvePoints = [
    -6, 0, 10, -1, 0, 10, 3, 0, 4, 6, 0, 1,
    11, 0, 2, 13, 0, 6, 9, 1, 9, 4, 1, 7,
    1, 1, 1, 0, 1, -5, 2, 0, -9, 8, 0, -10,
    13, 0, -5, 14, 1, 2, 10, 3, 7, 2, 1, 8,
    -4, 3, 7, -8, 1, 1, -9, 1, -4, -6, 1, -9,
    0, 1, -10, 7, 1, -7, 5, 2, 0, 0, 2, 2,
    -5, 1, 0, -7, 2, -5, -8, 2, -9, -11, 2, -10,
    -14, 1, -7, -13, 1, -2, -14, 0, 3, -11, 0, 10,
];

window.onload = () => {
    init();
};

async function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera();

    const eye = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 100);

    const scene = initScene();
    initAxesHelper(scene);
    renderer.setClearColor(0xffffff);

    const controls = initOrbitControls(camera, renderer.domElement);

    initAmbientLight(scene);

    const light = initDirectionLight('#ffffff', 5);
    light.position.copy(camera.position);

    const loader = initLoader();

    const curve = new CatmullRomCurve3(dataToVec3(curvePoints), true);
    const points = curve.getPoints(500);

    const params = {
        speed: 5,
        firstPersonView: false
    }

    const curveLength = curve.getLength();

    const road = new Mesh(createRoadGeometry(points, 1), new MeshBasicMaterial());
    scene.add(road);
    loader.load(`../../${Image_Path}/others/road.jpg`, (texture) => {
        texture.wrapS = RepeatWrapping;
        texture.repeat.set(100, 1);
        road.material.map = texture;
    });

    const car = await loader.loadAsync(`../../${Model_Path}/su7.glb`).then(({ scene: car }) => {
        car.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        car.children[0].rotateZ(HALF_PI)
        car.scale.set(0.2, 0.2, 0.2);
        scene.add(car);
        return car;
    });

    const clock = initClock();

    let time = 0;

    const position = new Vector3();
    const lookAt = new Vector3();
    const up = new Vector3(0, 1, 0);

    const offset = new Vector3(0, 0.2, 0);

    const eyeHelper = new CameraHelper(eye);
    scene.add(eyeHelper);

    const c = initCoordinates(2);
    scene.add(c);

    function render() {
        time = clock.getElapsedTime();

        const scale = (time * params.speed % curveLength) / curveLength;
        curve.getPoint(scale, position);
        curve.getPoint((scale + 0.01) % 1, lookAt);
        car.position.copy(position);
        car.matrix.lookAt(position, lookAt, up);
        car.quaternion.setFromRotationMatrix(car.matrix);


        eye.position.copy(position).add(offset);
        eye.matrix.lookAt(eye.position, lookAt, up);
        eye.quaternion.setFromRotationMatrix(eye.matrix);

        c.position.copy(eye.position);
        c.quaternion.copy(eye.quaternion);


        eyeHelper.update();
        if (params.firstPersonView) {
            renderer.render(scene, eye);
        } else {
            controls.update();
            renderer.render(scene, camera);
        }

        requestAnimationFrame(render);
    }
    render();
    resize(renderer, camera);

    const gui = initGUI();
    gui.add(params, "speed", 0.1, 20, 0.1);
    gui.add(params, "firstPersonView").onChange((v) => {
        const side = +v * 2;
        car.traverse((obj) => {
            if (obj.isMesh) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => (m.side = side));
                } else {
                    obj.material.side = side;
                }
            }
        })
    });
    gui.add(eyeHelper, 'visible')
}

function createRoadGeometry(points, width) {
    const halfWidth = width / 2;
    const up = new Vector3(0, 1, 0);

    const leftPoints = [];
    const rightPoints = [];

    const direction = new Vector3();
    const leftDirection = new Vector3();
    const rightDirection = new Vector3();

    const length = points.length;

    for (let j = 0; j < length; j++) {
        const current = points[j];
        const next = points[(j + 1) % length];

        direction.subVectors(next, current).normalize();

        leftDirection.copy(up).cross(direction);
        leftDirection.y = 0;
        leftDirection.normalize();

        rightDirection.copy(direction).cross(up);
        rightDirection.y = 0;
        rightDirection.normalize();

        const left = new Vector3().copy(leftDirection).multiplyScalar(halfWidth).add(current);
        const right = new Vector3().copy(rightDirection).multiplyScalar(halfWidth).add(current);

        leftPoints.push(left);
        rightPoints.push(right);
    }

    leftPoints.at(-1).copy(leftPoints[0]);
    rightPoints.at(-1).copy(rightPoints[0]);

    const position = [];
    const index = [];
    const uv = [];

    const _a = new Vector3();
    const _b = new Vector3();
    const _c = new Vector3();
    const _d = new Vector3();

    //   A------B
    //   |    / |
    //   |   /  |
    //   | /    |
    //   D------C
    //   L      R

    const pice = 1 / length;

    for (let j = 0, offset = 0; j < length; j++) {
        const [c, n] = [j, (j + 1) % length];
        _a.copy(leftPoints[n]);
        _b.copy(rightPoints[n]);
        _c.copy(rightPoints[c]);
        _d.copy(leftPoints[c]);

        position.push(
            _a.x, _a.y, _a.z,
            _b.x, _b.y, _b.z,
            _c.x, _c.y, _c.z,
            _d.x, _d.y, _d.z,
        );

        index.push(
            offset + 1, offset, offset + 3, // BAD
            offset + 3, offset + 2, offset + 1, // DCB
        );
        offset += 4;

        const [cp, np] = [c * pice, n * pice];
        uv.push(
            np, 0,//a
            np, 1,//b
            cp, 1,//c
            cp, 0,//d
        );
    }

    const geometry = new BufferGeometry();
    geometry.setIndex(index);
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(position), 3));
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2));
    geometry.computeVertexNormals();

    return geometry
}