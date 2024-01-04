/* eslint-disable camelcase */
/*
 * @Date: 2023-01-09 16:50:52
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-04 21:02:18
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

    light.target = sphere;

    // cannon
    const world = new World();
    world.gravity.set(0, 0, -9.82);

    const groundBody = new Body({ mass: 0, shape: new Plane() });
    groundBody.material = new Material({ friction: 100 });
    world.addBody(groundBody);

    const sphereBody = new Body({ mass: 2, shape: new Sphere(2, 64, 64) });
    sphereBody.material = new Material({ friction: 100 });
    sphereBody.position.set(0, 0, 2);
    sphereBody.linearDamping = 0

    world.addBody(sphereBody);

    const cannonDebugger = new CannonDebugger(scene, world, { color: 0xffff00 });

    const contactMaterial = new ContactMaterial(groundBody.material, sphereBody.material, { friction: 100, restitution: 1 })

    world.addContactMaterial(contactMaterial)


    const gui = initGUI();

    const positionMap = {
        top: new Vec3(0, 0, 3),
        center: new Vec3(0, 0, 2),
        bottom: new Vec3(0, 0, 1)
    }

    const operation = {
        debug: false,
        force: new Vec3(10, 0, 0),
        position: 'center',
        forceToBall() {
            sphereBody.applyLocalForce(this.force, positionMap[this.position])
        },
        impulseToBall() {
            sphereBody.applyLocalImpulse(this.force, positionMap[this.position])
        }
    }

    gui.add(operation, 'debug');
    gui.add(operation.force, 'x', 10, 1000, 1).name('Force value');
    gui.add(operation, 'position', Object.keys(positionMap)).name('Position');
    gui.add(contactMaterial, 'friction', 0, 100, 0.1).name('friction');
    gui.add(operation, 'forceToBall').name('Force to ball');
    gui.add(operation, 'impulseToBall').name('Impulse to ball');

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
        console.log(sphereBody.velocity.x);
    }

    renderer.setAnimationLoop(render);

}
