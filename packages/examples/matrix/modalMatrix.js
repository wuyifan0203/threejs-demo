/* eslint-disable no-unused-vars */

import {
    Scene,
    Mesh,
    Vector3,
    SphereGeometry,
    Clock,
    MeshBasicMaterial,
    TextureLoader,
    Matrix4,
    Quaternion
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';

import {
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
    createAxesHelper,
} from '../../lib/tools/index.js';



Mesh.prototype.setMultiplyScale = function (unit) {
    this.scale.set(unit, unit, unit);
}

window.onload = function () {
    init()
}

function init() {
    const renderer = initRenderer({ logarithmicDepthBuffer: true });
    const camera = initOrthographicCamera(new Vector3(1000, 1000, 1000));
    camera.lookAt(0, 0, 0)
    camera.up.set(0, 0, 1);
    const scene = new Scene();

    renderer.setClearColor(0xffffff);
    initCustomGrid(scene);
    createAxesHelper(scene);
    const orbitControl = new OrbitControls(camera, renderer.domElement);

    const sphere = new SphereGeometry(1, 32, 32);

    const createMaterial = (color = '#fff') => new MeshBasicMaterial({ color });

    //                          Sun : Mercury : Venus : Earth : Mars : Jupiter : Saturn : Uranus : Neptune   Unit
    // Radius                   109 :   0.38  : 0.94  :   1   : 0.53 : 10.97   :  9.14  :  3.98  :  3.86   (6,371 km)
    // Distance                  0  :   0.39  : 0.72  :   1   : 1.52 :  5.20   :  9.58  :  19.18 :  30.07  (1 AU)
    // period of revolution         :   0.24  : 0.62  :   1   : 1.88 :  11.86  :  29.46 :  84.01 :  164.8  (1 Earth Year) 
    // Direction of revolution      :    C    :  AC   :   C   :   C  :    C    :    C   :    AC  :    C
    // period of rotational         :   58.6  :  243  :   1   : 1.03 :  0.41   :  0.44  :   0.72 :  0.67   (1 Earth Day)
    // Direction of rotational      :    C    :  AC   :   C   :   C  :    C    :    C   :    AC  :    AC   

    // 0.set background
    const basePath = '../../resources/texture/plants/2k_';
    const loader = new TextureLoader();
    const getTexture = (path) => loader.load(basePath + path);
    scene.background = getTexture('stars_milky_way.jpg');


    // 1.create plants
    const plants = {
        Sun: new Mesh(sphere, createMaterial()),
        Mercury: new Mesh(sphere, createMaterial()),
        Venus: new Mesh(sphere, createMaterial()),
        Earth: new Mesh(sphere, createMaterial()),
        Mars: new Mesh(sphere, createMaterial()),
        Jupiter: new Mesh(sphere, createMaterial()),
        Saturn: new Mesh(sphere, createMaterial()),
        Uranus: new Mesh(sphere, createMaterial()),
        Neptune: new Mesh(sphere, createMaterial()),
    }

    // 2.add to scene
    scene.add(...Object.values(plants));

    const plantsScale = [10, 0.4, 0.94, 1, 0.65, 2.5, 3.5, 2.98, 2.86];
    const plantsPosition = [0, 16, 20, 25, 29, 35, 44, 54, 64];
    const plantsRevolution = [1, 0.24, 0.62, 1, 1.88, 11.86, 29.46, 84.01, 164.8]


    const texture = {
        Sun: getTexture('sun.jpg'),
        Mercury: getTexture('mercury.jpg'),
        Venus: getTexture('venus_surface.jpg'),
        Earth: getTexture('earth_daymap.jpg'),
        Mars: getTexture('mars.jpg'),
        Jupiter: getTexture('jupiter.jpg'),
        Saturn: getTexture('saturn.jpg'),
        Uranus: getTexture('uranus.jpg'),
        Neptune: getTexture('neptune.jpg')
    }
    let modalMatrix = new Matrix4()

    Object.keys(plants).forEach((key, i) => {
        const mesh = plants[key]
        // 3.set plant radius
        mesh.setMultiplyScale(plantsScale[i]);
        // 4.set plant position
        mesh.rotateX(Math.PI / 2);
        mesh.position.x = plantsPosition[i];
        // 5.set texture for plant
        mesh.material.map = texture[key];
    })


    let position;
    const axis = new Vector3(0,0,1);
    const translate = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3()

    // const modalMatrix = new Matrix4()
    const clock = new Clock();
    render();
    function render() {
        orbitControl.update();
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        animatePosition()
    }



    function animatePosition() {
        const t = clock.getElapsedTime();
        const delta = clock.getDelta();
        // Object.keys(plants).forEach((key, i) => {
            const mesh = plants.Venus
            // position = circlingMotion(plantsPosition[i], 1 / plantsRevolution[i], t, 0, 0);
            // mesh.applyMatrix4(modalMatrix.makeRotationAxis(axis,delta * Math.PI))
            translate.set(plantsPosition[2],0,0);
            quaternion.setFromAxisAngle(axis,delta * plantsRevolution[2]);
            scale.multiplyScalar(plantsScale[2]);
            mesh.applyMatrix4(modalMatrix.compose(translate,quaternion,scale))
            console.log(modalMatrix);
            // mesh.position.set(position.x, position.y, 0)
        // })
    }

    window.camera = camera;
    window.scene = scene;

    function circlingMotion(r, w, t, x, y) {
        return { x: x + r * Math.cos(w * t), y: y + r * Math.sin(w * t) };
    }

}

