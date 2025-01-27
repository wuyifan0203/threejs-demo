/*
 * @Date: 2023-04-28 13:30:57
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-02 14:12:29
 * @FilePath: /threejs-demo/src/render/renderMutiSceneByTarget.js
 */
import {
    Mesh,
    Vector3,
    AmbientLight,
    BoxGeometry,
    MeshStandardMaterial,
    Clock,
    GridHelper,
    Vector2,
    WebGLRenderTarget
} from 'three';

import {
    initRenderer,
    initOrthographicCamera,
    resize,
    initGroundPlane,
    initDirectionLight,
    initScene,
    initGUI,
    initOrbitControls
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer({ logarithmicDepthBuffer: true });
    renderer.shadowMap.enabled = true;
    renderer.setAnimationLoop(animate);
    renderer.setClearColor(0xfffee);
    renderer.autoClear = false;

    const camera = initOrthographicCamera(new Vector3(-1000, 1000, 1000));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);

    const scene1 = initScene();

    const light = initDirectionLight();
    light.position.set(20, 20, 20);
    light.target = scene1;

    scene1.add(light);
    scene1.add(new AmbientLight());

    initGroundPlane(scene1, new Vector2(20, 20));

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    const mesh = new Mesh(new BoxGeometry(5, 4, 3), new MeshStandardMaterial({ color: 0x049ef4, roughness: 0 }));
    mesh.position.set(0, 0, 6);
    mesh.castShadow = true;
    scene1.add(mesh);

    const scene2 = initScene();
    const grid = new GridHelper(10, 10);
    grid.castShadow = true;
    scene2.add(grid);

    const clock = new Clock();

    const size = new Vector2();

    renderer.getSize(size)

    const renderTarget = new WebGLRenderTarget(size.x, size.y);

    // renderer.setRenderTarget(renderTarget);


    function animate() {
        const time = clock.getElapsedTime();
        mesh.rotation.x = time * 2;
        mesh.rotation.y = time * 2;
        grid.rotation.z = time * 3;
        orbitControl.update();
        // renderer.clear();
        // renderer.render(scene1, camera);
        // renderer.render(scene2, camera);
    }

    const o = {
        look() {
            renderer.setRenderTarget(renderTarget);
            renderer.clear();

            renderer.render(scene1, camera);
            renderer.render(scene2, camera);

            const {x,y} = size
            const pixels = new Uint8Array(x * y * 4);
            renderer.readRenderTargetPixels(renderTarget, 0, 0, x, y, pixels);

            const canvas = document.createElement('canvas');
            canvas.width = x;
            canvas.height = y;
            const context = canvas.getContext('2d');
            const imageData = context.createImageData(x, y);
            imageData.data.set(pixels);
            context.putImageData(imageData, 0, 0);


            context.translate(0, y);
            context.scale(1, -1);
            context.drawImage(canvas, 0, 0, x, y, 0, 0, x, y);

            const dataURL = canvas.toDataURL();


            // 调试
            console.log(
                '%c image',
                `background-image: url(${dataURL});
                 background-size: contain;
                 background-repeat: no-repeat;
                 padding: 200px;
                `,
            );


        }
    }

    resize(renderer, camera);

    const gui = initGUI();
    gui.add(o, 'look').name('check result (press F12)')
}
