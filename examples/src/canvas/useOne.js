/*
 * @Date: 2023-09-06 10:24:50
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-11-06 18:08:09
 * @FilePath: /threejs-demo/examples/src/canvas/useOne.js
 */
import {
    BoxGeometry,
    Mesh, Vector3, MeshBasicMaterial, Quaternion, Euler, Clock, OrthographicCamera, PlaneGeometry, MeshDepthMaterial, Vector4, Color, CanvasTexture
} from '../lib/three/three.module.js'
import {
    initCoordinates,
    initCustomGrid,
    initGUI, initOrbitControls, initOrthographicCamera, initRenderer, initScene
} from '../lib/tools/common.js';

window.onload = () => {
    init();
}

function init() {
    const renderer = initRenderer();
    const gui = initGUI();
    const scene = initScene();
    const camera = initOrthographicCamera(new Vector3(0, -30, 30));
    renderer.setClearColor(0xffffff, 1);
    renderer.autoClear = false;
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();
    const coord = initCoordinates();
    scene.add(coord);
    const grid = initCustomGrid(scene, 50, 50);

    const orbitControls = initOrbitControls(camera, renderer.domElement);
    const uiScene = initScene();
    const uiCamera = new OrthographicCamera(0, renderer.domElement.clientWidth / 2, renderer.domElement.clientHeight / 2, 0, 0, 1);


    const plane = new Mesh(new PlaneGeometry(renderer.domElement.clientWidth / 2, renderer.domElement.clientHeight), new MeshBasicMaterial({ color: 'red' }));

    uiScene.add(plane);

    // uiScene.background = new Color(0xdf2345);

    const canvas = document.createElement('canvas');
    canvas.width = renderer.domElement.clientWidth / 2;
    canvas.height = renderer.domElement.clientHeight;

    var context = canvas.getContext('2d');

    context.fillStyle = 'blue';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'white';
    context.font = '30px Arial';
    context.fillText('Hello, CanvasTexture!', 650, 30);

    const planeTexture = new CanvasTexture(canvas);



    plane.material.map = planeTexture;






    renderer.setAnimationLoop(animation);
    function animation() {

        render()
    }

    const vtmp = new Vector4()

    function render() {
        renderer.clear();
        renderer.render(scene, camera);
        renderer.getViewport(vtmp);

        renderer.clearDepth();
        // renderer.setViewport(0,0,1353,938)
        renderer.render(uiScene, uiCamera);

        // console.log(vtmp);

        renderer.setViewport(vtmp.x, vtmp.y, vtmp.z, vtmp.w)

    }


    orbitControls.addEventListener('change', () => {

        render()

    })

    const box = new Mesh(new BoxGeometry(5, 3, 2), new MeshBasicMaterial({ color: 0xfd6789 }))

    scene.add(box);




}