/*
 * @Date: 2023-04-28 13:30:57
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-14 19:37:25
 * @FilePath: /threejs-demo/src/render/renderForOpacity.js
 */
import {
    Scene,
    Mesh,
    Vector3,
    AmbientLight,
    BoxGeometry,
    MeshStandardMaterial,
    MeshPhysicalMaterial,
} from '../lib/three/three.module.js';

import {
    initRenderer,
    initOrthographicCamera,
    resize,
    initDirectionLight,
    initOrbitControls,
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0xfffee);
    renderer.autoClear = false;


    const camera = initOrthographicCamera(new Vector3(-1000, 1000, 1000));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);

    const scene1 = initScene();

    const light = initDirectionLight();
    light.position.set(20, 20, 20);
    light.target = scene1;


    scene1.add(light);
    scene1.add(new AmbientLight());



    const orbitControl = initOrbitControls(camera, renderer.domElement);

    const mesh = new Mesh(new BoxGeometry(15, 2, 1), new MeshStandardMaterial({ color: 0x049ef4, roughness: 0 }));
    mesh.position.set(0, 0, 6);
    mesh.castShadow = true;
    scene1.add(mesh);

    const scene2 = initScene();

    const geometry = new BoxGeometry(6, 4, 4);
    const material = new MeshPhysicalMaterial({
        color: 0xaaaaaa, 
        transparent: true,
        opacity: 1,
        roughness: 0, 
        transmission:1,
        metalness: 0,
        ior: 1.04,
        thickness: 0.01,
        specularIntensity:1,
        specularColor:0xffffff,
        side:2,
        clearcoat:1
    });
    const mesh2 = new Mesh(geometry, material);
    mesh2.castShadow = true;
    mesh2.position.set(0, 0, 6);
    scene2.add(mesh2);

    const mesh3 = new Mesh(new BoxGeometry(2,1,20), new MeshStandardMaterial({ color: 0x049e5c,roughness: 0 }));
    mesh3.castShadow = true;
    mesh3.position.set(0, 0, 6);
    scene2.add(mesh3);

    scene2.add(new AmbientLight());


    let needUpdate = false;

    function render() {
        renderer.clear();
        orbitControl.update();
        renderer.render(scene1, camera);
        renderer.render(scene2, camera);
        needUpdate = false;
    }

    renderer.setAnimationLoop(render);

    resize(renderer, camera);
}
