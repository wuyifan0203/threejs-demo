/*
 * @Date: 2023-09-17 14:41:06
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-03-19 17:20:28
 * @FilePath: /threejs-demo/src/camera/orthographic.js
 */
import {
    Vector3,
    PointLight,
    Mesh,
    BoxGeometry,
    MeshLambertMaterial,
    OrthographicCamera,
    CameraHelper,
    AmbientLight
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrthographicCamera,
    initScene,
    initOrbitControls,
    initGUI,
    initDirectionLight
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    const camera = initOrthographicCamera(new Vector3(1000, 1000, 1000));
    camera.zoom = 0.5;
    camera.up.set(0, 0, 1)
    camera.updateProjectionMatrix();
    const scene = initScene();

    const orthographicCamera = new OrthographicCamera();
    orthographicCamera.up.set(0, 0, 1);
    orthographicCamera.position.set(0, -10, 0);
    orthographicCamera.lookAt(new Vector3(0, 0, 0));
    const cameraHelper = new CameraHelper(orthographicCamera);

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    window.target = orthographicCamera

    const light = initDirectionLight();
    light.position.copy(orthographicCamera);
    scene.add(light);
    scene.add(new AmbientLight());

    const geometry = new BoxGeometry(2, 2, 2);
    const colors = ['red', 'yellow', 'green', 'skyblue', 'orange', 'pink'];
    const materials = colors.map((color) => new MeshLambertMaterial({ color: color }));



    for (let j = 0, k = colors.length; j < 100; j++) {
        const mesh = new Mesh(geometry, materials[j % k]);

        mesh.position.set(getRandomNumber(-20, 20), getRandomNumber(1, 25), getRandomNumber(-20, 20));
        scene.add(mesh);
    }



    const params = {
        left: -10,
        right: 10,
        far: 20,
        near: 1,
        top: 10,
        bottom: -10,
        zoom: 1
    }

    function updateCamera() {
        orthographicCamera.left = params.left;
        orthographicCamera.right = params.right;
        orthographicCamera.far = params.far;
        orthographicCamera.near = params.near;
        orthographicCamera.top = params.top * window.innerHeight / window.innerWidth;
        orthographicCamera.bottom = params.bottom * window.innerHeight / window.innerWidth;
        orthographicCamera.zoom = params.zoom;
        orthographicCamera.updateProjectionMatrix();

        cameraHelper.update();
    }

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    scene.add(cameraHelper);
    updateCamera();


    function animate() {
        light.position.copy(camera.position);
        const [width, height] = [renderer.domElement.clientWidth, renderer.domElement.clientHeight];
        renderer.setClearColor(0xebebeb, 1);
        renderer.setViewport(0, 0, width, height);
        renderer.setScissor(0, 0, width, height);
        cameraHelper.visible = true;
        renderer.render(scene, camera);

        renderer.setClearColor(0xffffff, 1);
        renderer.clearDepth();

        renderer.setScissorTest(true);
        cameraHelper.visible = false;


        renderer.setViewport(0, 0, width * 0.3, height * 0.3);
        renderer.setScissor(0, 0, width * 0.3, height * 0.3);
        renderer.render(scene, orthographicCamera);
        renderer.setScissorTest(false);

        orbitControl.update();
    }

    renderer.setAnimationLoop(animate);

    const gui = initGUI();

    gui.add(params, 'bottom', -20, -1, 1).onChange(updateCamera);
    gui.add(params, 'left', -20, -1, -1).onChange(updateCamera);
    gui.add(params, 'right', 1, 20, 1).onChange(updateCamera);
    gui.add(params, 'top', 1, 20, 1).onChange(updateCamera);
    gui.add(params, 'near', 0, 10, 1).onChange(updateCamera);
    gui.add(params, 'far', 10, 35, 1).onChange(updateCamera);
    gui.add(params, 'zoom', 0.2, 3, 0.01).onChange(updateCamera);
}
