/* eslint-disable camelcase */
/*
 * @Date: 2023-05-08 17:17:11
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-11-27 20:50:16
 * @FilePath: /threejs-demo/src/tween/potal.js
 */
import {
    Mesh,
    MeshBasicMaterial,
    Scene,
    TorusGeometry,
    Vector3,
    PerspectiveCamera,
    CameraHelper,
    SphereGeometry,
    Object3D,
    Clock,
    TextureLoader,
    MirroredRepeatWrapping,
    AudioListener,
    AudioLoader,
    Audio
} from '../lib/three/three.module.js';
import {
    initRenderer,
    initOrbitControls,
    resize,
    initPerspectiveCamera,
    initGUI,
    initCustomGrid
} from '../lib/tools/index.js';
import {
    Tween, update, Easing,
} from '../lib/other/tween.esm.js';

window.onload = () => {
    init();
};

async function init() {
    const renderer = initRenderer();
    renderer.setClearColor(0xffffff);
    const camera = initPerspectiveCamera(new Vector3(30, -30, 30));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);

    const scene = new Scene();

    const parent = new Object3D();
    scene.add(parent);

    const splineCamera = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.01, 30);
    splineCamera.up.set(0, 0, 1);
    splineCamera.lookAt(0, 1, 0);
    splineCamera.zoom = 0.3;
    parent.add(splineCamera);

    const cameraHelper = new CameraHelper(splineCamera);
    scene.add(cameraHelper);

    const cameraEye = new Mesh(new SphereGeometry(2), new MeshBasicMaterial({ color: 0xdddddd }));
    parent.add(cameraEye);

    scene.add(parent)

    parent.position.set(-20, 0, 0);

    const gui = initGUI();

    const loader = new TextureLoader();

    const loaderAudio = new AudioLoader();
    const listener = new AudioListener();
    const buffer = await loaderAudio.loadAsync('../../public/audio/Shooting Star.mp3');

    const audio = new Audio(listener);
    audio.setBuffer(buffer);
    audio.setLoop(true);
    audio.setVolume(0.5);
    audio.play();

    splineCamera.add( listener );



    const texture = await loader.loadAsync('../../public/images/start/start.jpg');

    texture.wrapS = MirroredRepeatWrapping;
    texture.wrapT = MirroredRepeatWrapping;

    texture.repeat.set(4, 4);

    const tween = new Tween({ speed: 2, repeatY: 2 }).to({ speed: [8, 2], repeatY: [6, 2] }, 6000).easing(Easing.Quartic.In);
    const o = {
        godMode: true,
        speed: 2,
        addSpeed() {
            tween.start()
        }
    };

    console.log(tween);

    tween.onUpdate((e) => {
        texture.repeat.y = e.repeatY;
        texture.needsUpdate = true;
        o.speed = e.speed;
    })







    const orbitControls = initOrbitControls(camera, renderer.domElement);


    const geometry = new TorusGeometry(20, 3, 64, 100);
    const material = new MeshBasicMaterial({ side: 1, map: texture, color: '0x0000ff' })
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    resize(renderer, camera);

    var range = Math.PI / 10;

    parent.rotateZ(-range);



    gui.add(o, 'addSpeed')





    const clock = new Clock();
    function render() {
        const t = clock.getDelta();
        orbitControls.update();
        mesh.rotateZ(t * o.speed)
        parent.rotateY(range * Math.sin(t));

        update();
        renderer.render(scene, o.godMode ? camera : splineCamera);

        requestAnimationFrame(render);
    }

    render();

    gui.add(o, 'godMode').onChange(() => {
        cameraHelper.visible = o.godMode;
    })

    window.scene = scene;
    window.camera = camera;
}