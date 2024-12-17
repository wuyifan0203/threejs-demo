/*
 * @Date: 2023-09-06 10:24:50
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-26 17:59:47
 * @FilePath: /threejs-demo/src/canvas/useOne.js
 */
import {
    BoxGeometry,
    Mesh, 
    Vector3, 
    MeshBasicMaterial, 
    OrthographicCamera, 
    PlaneGeometry, 
    Vector4, 
    Color, 
    CanvasTexture
} from 'three'
import {
    initCoordinates,
    initCustomGrid,
    initGUI, 
    initOrbitControls, 
    initOrthographicCamera, 
    initRenderer, 
    initScene
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

    scene.background = new Color(0xffffff);
    scene.add(coord);
    initCustomGrid(scene, 50, 50);

    const orbitControls = initOrbitControls(camera, renderer.domElement);
    const uiScene = initScene();

    const uiCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const plane = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ color: 'red' }));

    // plane.position.set(renderer.domElement.clientWidth, renderer.domElement.clientHeight, 0);

    uiCamera.zoom =2
    uiCamera.updateProjectionMatrix();

    uiScene.add(plane);

    // uiScene.background = new Color(0xdf2345);

    const canvas = document.createElement('canvas');
    canvas.width = renderer.domElement.clientWidth;
    canvas.height = renderer.domElement.clientHeight;

    var context = canvas.getContext('2d');

    context.fillStyle = 'blue';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'white';
    context.font = '30px Arial';
    context.fillText('Hello, CanvasTexture!', 0, 30);

    const planeTexture = new CanvasTexture(canvas);

    plane.material.map = planeTexture;

  
    function animation() {
        render()
    }

    renderer.setAnimationLoop(animation);

    const vtmp = new Vector4()

    function render() {
        renderer.clear();
        renderer.setScissorTest( true );

        renderer.setClearColor( 0x000000, 0 );
        renderer.setScissor( 0, 0, renderer.domElement.clientWidth, renderer.domElement.clientHeight );
        renderer.setViewport(0,0,renderer.domElement.clientWidth,renderer.domElement.clientHeight);

        renderer.render(plane, uiCamera);

        // renderer.clear()

        // renderer.setClearColor( 0xffffff, 1 );
        renderer.clearDepth();
        // renderer.clearColor();


        renderer.setScissor( 40, 0, renderer.domElement.clientWidth - 40, renderer.domElement.clientHeight- 40 );

        renderer.setViewport(40, 0, renderer.domElement.clientWidth - 40, renderer.domElement.clientHeight- 40);

        renderer.render(scene, camera);

        renderer.setScissorTest( false );

    }

    orbitControls.addEventListener('change', () => {
        render()
    })

    const box = new Mesh(new BoxGeometry(5, 3, 2), new MeshBasicMaterial({ color: 0xfd6789 }))
    scene.add(box);

}