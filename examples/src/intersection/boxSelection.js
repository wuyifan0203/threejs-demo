/*
 * @Date: 2023-09-06 10:24:50
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-26 17:53:52
 * @FilePath: /threejs-demo/examples/src/intersection/boxSelection.js
 */
import {
    BoxGeometry,
    Mesh, Vector2, Vector3, MeshBasicMaterial, Quaternion,Euler
} from '../lib/three/three.module.js'
import {
    initAxesHelper,
    initCoordinates,
    initCustomGrid,
    initGUI, initOrbitControls, initOrthographicCamera, initRenderer, initScene
} from '../lib/tools/common.js';
import { ViewHelper } from './box.js'

window.onload = () => {
    init();
}

function init() {
    const renderer = initRenderer();
    const gui = initGUI();
    const scene = initScene();
    const camera = initOrthographicCamera(new Vector3(2, -30, 30));
    renderer.setClearColor(0xffffff, 1);
    renderer.autoClear = false;
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();
    console.log(camera);
    const coord = initCoordinates();
    // scene.add(coord);
    const grid = initCustomGrid(scene, 50, 50);

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const viewHelper = new ViewHelper(camera, renderer.domElement)

    // scene.add(viewHelper)

    renderer.setAnimationLoop(animation);
    function animation() {
        renderer.clear();
        const scale = 1 / camera.zoom;
        coord.scale.set(scale, scale, scale);
        orbitControls.update();
        renderer.render(scene, camera);
        viewHelper.render(renderer)
    }

    const box = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x0f00f5 })
    )

    box.add(initCoordinates(2))

    const box2 = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x0f00f5 })
    )

    box2.add(initCoordinates(2))

    box2.position.set(0, 5, 0);

    box2.applyQuaternion(new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0)));


    scene.add(box2);


    scene.add(box)


    const cursor = new Vector2()

    renderer.domElement.addEventListener('click', (event) => {
        const { clientX, clientY } = event

        const { width, height } = renderer.domElement;

        const outWidth = width - 128;
        const outHeight = height - 128;

        if (clientX > outWidth && clientY > outHeight) {
            cursor.x = clientX;
            cursor.y = clientY;
            viewHelper.handelClick(cursor)
        }
    });


}