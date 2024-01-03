/* eslint-disable camelcase */
/*
 * @Date: 2023-01-09 16:50:52
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-03 20:58:33
 * @FilePath: /threejs-demo/src/cannon/force.js
 */
import {
    Mesh,
    Clock,
    SphereGeometry,
    Vector3,
    TextureLoader,
    LoadingManager,
    CameraHelper,
    MeshStandardMaterial,
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrthographicCamera,
    initOrbitControls,
    initGUI,
    initScene,
    initAmbientLight,
    initDirectionLight,
    initGroundPlane,
    resize,
    initProgress
} from '../lib/tools/index.js';
import {
    World, Body, Material, ContactMaterial, Plane, NaiveBroadphase, Sphere, Vec3, Trimesh, Quaternion
} from '../lib/other/physijs/cannon.js';
import CannonDebugger from '../lib/other/physijs/cannon-es-debugger.js'

window.onload = () => {
    init();
};
const basePath = '../../public/images/moon/';
const url = {
    color: `${basePath}COLOR.jpg`,
    normal: `${basePath}NORM.jpg`,
    displacement: `${basePath}DISP.png`,
    occlusion: `${basePath}OCC.jpg`,
    specular: `${basePath}SPEC.jpg`
}

function init() {
    const renderer = initRenderer({});

    const camera = initOrthographicCamera(new Vector3(100, 100, 100));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const scene = initScene();

    initGroundPlane(scene);
    initAmbientLight(scene);

    const light = initDirectionLight();
    light.shadow.camera.near = camera.near;
    light.shadow.camera.far = camera.far;
    light.shadow.camera.left = camera.left;
    light.shadow.camera.right = camera.right;
    light.shadow.camera.top = camera.top;
    light.shadow.camera.bottom = camera.bottom;
    light.position.set(40, 40, 70);
    scene.add(light);

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    const sphereMaterial = new MeshStandardMaterial();

    const progress = initProgress();
    document.querySelector('#webgl-output').appendChild(progress);

    const manager = new LoadingManager();

    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        progress.setProgress(itemsLoaded / itemsTotal * 100)
        progress.setText(url);

        if (itemsLoaded / itemsTotal === 1) {
            progress.hide();
            sphereMaterial.needsUpdate = true;
        }
    }

    const loader = new TextureLoader(manager);

    loader.load(url.color, (texture) => {
        sphereMaterial.map = texture
    });
    loader.load(url.normal, (texture) => {
        sphereMaterial.normalMap = texture
    });
    loader.load(url.occlusion, (texture) => {
        sphereMaterial.aoMap = texture
    });
    loader.load(url.specular, (texture) => {
        sphereMaterial.roughnessMap = texture;
        sphereMaterial.metalnessMap = texture;
    });
    loader.load(url.displacement, (texture) => {
        sphereMaterial.displacementMap = texture;
        sphereMaterial.displacementBias = 0;
        sphereMaterial.displacementScale = -0.2;
    });

    const sphere = new Mesh(new SphereGeometry(2, 64, 64), sphereMaterial);
    sphere.castShadow = true;

    scene.add(sphere);

    // cannon
    const world = new World();
    world.gravity.set(0, 0, -9.82);

    const groundBody = new Body({ mass: 0, shape: new Plane() });
    world.addBody(groundBody);

    const sphereBody = new Body({ mass: 2, shape: new Sphere(2, 64, 64) });
    sphereBody.material = new Material({ restitution: 1 });
    sphereBody.position.set(0, 0, 2);

    world.addBody(sphereBody);

    const cannonDebugger = new CannonDebugger(scene, world, { color: 0xffff00 });

    const material = new Material();

    // 创建接触材料
    const contactMaterial = new ContactMaterial(material, material, {
        friction: 0.5, // 摩擦系数
        restitution: 0.2, // 恢复系数
    });

    // 将接触材料添加到物理世界中
    world.addContactMaterial(contactMaterial);






    const gui = initGUI();

    const operation = {
        debug: false,
        force: new Vec3(100, 0, 0),
        forceToTop() {
            sphereBody.applyForce(this.force, new Vec3(0, 0, 1.5))
        }
    }

    gui.add(operation, 'debug');
    gui.add(operation.force, 'x', 10, 1000, 1).name('Force');
    gui.add(operation, 'forceToTop').name('Force to Top');

    resize(renderer, camera);

    const clock = new Clock();
    const timeStep = 1 / 60
    function render() {
        const deltaTime = clock.getDelta();
        orbitControl.update();
        operation.debug && cannonDebugger.update();
        world.step(timeStep, deltaTime);
        sphere.position.copy(sphereBody.position);
        sphere.quaternion.copy(sphereBody.quaternion);
        renderer.render(scene, camera);
        updateShadowFrustum()
    }
    const defaultUp = new Vector3(0, 1, 0);

    function updateShadowFrustum() {
        // 更新视椎体的位置、方向和投影范围
        light.shadow.matrix.lookAt(light.position, sphere.position, defaultUp);
        
    }

    const helper = new CameraHelper(light.shadow.camera);
    scene.add(helper);


    renderer.setAnimationLoop(render);

}
