/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-03-25 10:30:05
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-03-26 09:38:55
 * @FilePath: /threejs-demo/src/render/renderWBOIT.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    SphereGeometry,
    MeshStandardMaterial,
    TorusKnotGeometry,
    Mesh,
    BoxGeometry,
    TextureLoader,
    PlaneGeometry,
    PerspectiveCamera
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initScene,
    initOrbitControls,
    initAmbientLight,
    initDirectionLight,
    initPerspectiveCamera,
} from '../lib/tools/common.js';

window.onload = function () {
    init();
}

async function init() {
    const scene = initScene();
    const renderer = initRenderer();
    renderer.setClearColor(0x000000, 1);

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);

    const light = initDirectionLight();
    light.castShadow = true;
    light.position.set(0, 0, 3);
    scene.add(light);
    initAmbientLight(scene)

    const orbitControl = initOrbitControls(camera, renderer.domElement);
    orbitControl.addEventListener('change', render);

    const sphereMesh = new Mesh(new SphereGeometry(), new MeshStandardMaterial());
    sphereMesh.position.set(1.5, 0, 3);
    sphereMesh.castShadow = true;
    scene.add(sphereMesh);

    const knotMesh = new Mesh(
        new TorusKnotGeometry(1, 0.4, 128, 32),
        new MeshStandardMaterial({ transparent: true, opacity: 0.5, side: 2 })
    );
    knotMesh.rotateX(Math.PI / 2)
    knotMesh.receiveShadow = true;
    scene.add(knotMesh);

    const boxMesh = new Mesh(new BoxGeometry(), new MeshStandardMaterial({ color: 0xf0a000 }));
    scene.add(boxMesh);

    const loader = new TextureLoader();
    const texture1 = await loader.loadAsync('../../public/images/render/sprite.png');

    const planeGeometry = new PlaneGeometry(3, 3);

    const planeMesh1 = new Mesh(planeGeometry, new MeshStandardMaterial({ side: 2, map: texture1 }));
    planeMesh1.rotateX(Math.PI / 2);
    planeMesh1.position.set(-1.6, 0, 1.5);
    scene.add(planeMesh1);

    const planeMesh2 = new Mesh(planeGeometry, new MeshStandardMaterial({ side: 2, map: texture1, transparent: true }));
    planeMesh2.rotation.x = Math.PI / 2;
    planeMesh2.rotation.y = Math.PI * -0.2;
    planeMesh2.position.set(-1.2, 0, -1.5);
    scene.add(planeMesh2);

    // const 


    function render() {
        renderer.render(scene, camera)
    }

    renderer.setAnimationLoop(render)
}