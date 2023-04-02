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
    Quaternion,
} from '../../lib/three/three.module.js';
import { OrbitControls } from '../../lib/three/OrbitControls.js';

import {
    initRenderer,
    initOrthographicCamera,
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


    Object.keys(plants).forEach((key, i) => {
        const mesh = plants[key]
        // 3.set texture for plant
        mesh.material.map = texture[key];
        mesh.name = key
    })

    const axisX = new Vector3(1,0,0);
    const axisZ = new Vector3(0,0,1);
    const PI = Math.PI
    const HalfPI = PI / 2;
    const clock = new Clock();
    let t,pos;

    const tarnslateMat4 = new Matrix4();
    const rotateMat4 = new Matrix4();
    const rotateZMat4 = new Matrix4();
    const rotateXMat4 = new Matrix4().makeRotationAxis(axisX,HalfPI);
    const scaleMat4 = new Matrix4();
    const modalMatrix = new Matrix4()

    const position = new Vector3();
    const rotate = new Quaternion();
    const scale = new Vector3();

    function animatePosition() {
        t = clock.getElapsedTime();
        const delta = clock.getDelta();
 
        Object.keys(plants).forEach((key, i) => {
            modalMatrix.identity();
            rotateMat4.identity();
            scaleMat4.identity();
            tarnslateMat4.identity();
            rotateZMat4.identity();
            const mesh = plants[key];
            pos = circlingMotion(plantsPosition[i],1/plantsRevolution[i],t,0,0);
            tarnslateMat4.makeTranslation(pos.x,pos.y,0);
            rotateMat4.premultiply(rotateXMat4).premultiply(rotateZMat4.makeRotationZ(t))
            scaleMat4.makeScale(plantsScale[i],plantsScale[i],plantsScale[i]);
            modalMatrix.multiply(tarnslateMat4.multiply(rotateMat4.multiply(scaleMat4)))
            modalMatrix.decompose(position,rotate,scale)
            mesh.position.copy(position);
            mesh.quaternion.copy(rotate);
            mesh.scale.copy(scale);
        })
    }


    render();
    function render() {
        orbitControl.update();
        renderer.render(scene, camera);
        animatePosition();
        requestAnimationFrame(render);

    }


    window.camera = camera;
    window.scene = scene;

    function circlingMotion(r, w, t, x, y) {
        return { x: x + r * Math.cos(w * t), y: y + r * Math.sin(w * t) };
    }

}

