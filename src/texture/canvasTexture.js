/*
 * @Date: 2023-09-06 10:24:50
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-11-09 17:49:23
 * @FilePath: /threejs-demo/examples/src/canvas/useOne2.js
 */
import {
    BoxGeometry,
    Mesh, Vector3, MeshBasicMaterial, Color,
} from '../lib/three/three.module.js'
import {
    initCoordinates,
    initCustomGrid,
    initGUI, initOrbitControls, initOrthographicCamera, initRenderer, initScene
} from '../lib/tools/common.js';
import { Ruler } from "../helper/Ruler.js";

window.onload = () => {
    init();
}

function init() {
    const renderer = initRenderer();
    const gui = initGUI();
    const scene = initScene();
    const camera = initOrthographicCamera(new Vector3(0, 0, 30));
    renderer.setClearColor(0xffffff, 1);
    renderer.autoClear = false;
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();
    const coord = initCoordinates();

    scene.background = new Color(0xffffff);
    scene.add(coord);

    initCustomGrid(scene, 50, 50);

    const orbitControls = initOrbitControls(camera, renderer.domElement);



    const ruler = new Ruler(camera, renderer);




    orbitControls.addEventListener('change',()=>{
        render();
    })


    function render() {
        renderer.clear();

        ruler.render();

        renderer.setScissorTest(true);

        renderer.setScissor(40, 0, renderer.domElement.clientWidth - 40, renderer.domElement.clientHeight - 40);

        renderer.setViewport(40, 0, renderer.domElement.clientWidth - 40, renderer.domElement.clientHeight - 40);

        renderer.render(scene, camera);

        renderer.setScissorTest(false);

    }


    orbitControls.addEventListener('change', () => {

        render()

    })

    const box = new Mesh(new BoxGeometry(5, 3, 2), new MeshBasicMaterial({ color: 0xfd6789 }))

    scene.add(box);

    render();


}