/*
 * @Date: 2023-04-28 13:30:57
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-22 13:10:02
 * @FilePath: /threejs-demo/examples/src/render/renderForOpacity.js
 */
import {
    Scene,
    Mesh,
    Vector3,
    AmbientLight,
    DirectionalLight,
    BoxGeometry,
    MeshStandardMaterial,
    Clock,
    MeshPhysicalMaterial,
    Vector2,
    TextureLoader
} from '../lib/three/three.module.js';

import {
    initRenderer,
    initOrthographicCamera,
    resize,
    initGroundPlane,
    initOrbitControls,
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const loader = new TextureLoader()
    const renderer = initRenderer({ logarithmicDepthBuffer: true });
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0xfffee);
    renderer.autoClear = false;


    const camera = initOrthographicCamera(new Vector3(-1000, 1000, 1000));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);

    const scene1 = new Scene();

    const light = new DirectionalLight();
    light.castShadow = true;
    light.shadow.mapSize.height = 2048;
    light.shadow.mapSize.width = 2048;
    light.shadow.camera.near = 1; // default
    light.shadow.camera.far = 10000; // default
    light.position.set(20, 20, 20);
    light.target = scene1;

    scene1.background = loader.load("../../public/images/sky2/nx.png")

    scene1.add(light);
    scene1.add(new AmbientLight());


    initGroundPlane(scene1, new Vector2(20, 20));

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    const mesh = new Mesh(new BoxGeometry(15, 2, 1), new MeshStandardMaterial({ color: 0x049ef4, roughness: 0 }));
    mesh.position.set(0, 0, 6);
    mesh.castShadow = true;
    scene1.add(mesh);

    const scene2 = new Scene();
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
