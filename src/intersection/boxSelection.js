/*
 * @Date: 2023-09-06 10:24:50
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-25 19:58:44
 * @FilePath: /threejs-demo/src/intersection/boxSelection.js
 */
import {
    BoxGeometry,
    Mesh, Vector2, Vector3, MeshBasicMaterial, Quaternion, Euler, Clock
} from '../lib/three/three.module.js'
import {
    initAxesHelper,
    initScene,
    initCoordinates,
    initCustomGrid,
    initOrbitControls, 
    initOrthographicCamera, 
    initRenderer, 
} from '../lib/tools/common.js';
import { CustomViewHelper } from './CustomViewHelper.js'

window.onload = () => {
    init();
}

function init() {
    const renderer = initRenderer();
    const scene = initScene();
    const camera = initOrthographicCamera(new Vector3(0, -30, 30));
    renderer.setClearColor(0xffffff, 1);
    renderer.autoClear = false;
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();
    console.log(camera);
    const coord = initCoordinates();
    scene.add(coord);
    const grid = initCustomGrid(scene, 50, 50);

    const orbitControls = initOrbitControls(camera, renderer.domElement);

    const viewHelper = new CustomViewHelper(camera, renderer.domElement)

    // scene.add(viewHelper)

    renderer.setAnimationLoop(animation);
    const clock = new Clock()
    function animation() {
        const dt = clock.getDelta();

        if (viewHelper.animating) {
            viewHelper.update(dt);
            render()
        }
    }

    function render() {
        renderer.clear();
        renderer.render(scene, camera);
        viewHelper.render(renderer);

    }


    orbitControls.addEventListener('change', () => {
      
        render()

    })

    const box = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x0f00f5 })
    )

    box.add(initCoordinates(2))

    const box2 = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x0f00f5 })
    )

    box2.add(initCoordinates(2))

    box2.position.set(0, 5, 0);

    box2.applyQuaternion(new Quaternion().setFromEuler(new Euler(Math.PI, 0, Math.PI)));


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
            viewHelper.target.copy(orbitControls.target)
            viewHelper.handelClick(cursor);
        }
    });

    render();
    viewHelper.render(renderer);

}