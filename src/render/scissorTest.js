/*
 * @Date: 2023-04-28 13:30:57
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-22 13:45:34
 * @FilePath: \threejs-demo\src\render\scissorTest.js
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
    TextureLoader
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    resize,
    initGroundPlane,
    initScene,
    initDirectionLight,
    initOrbitControls,
    matrixRender
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const loader = new TextureLoader()
    const renderer = initRenderer({ logarithmicDepthBuffer: true });
    renderer.shadowMap.enabled = true;
    renderer.autoClear = false;


    const camera = initOrthographicCamera(new Vector3(-1000, 1000, 1000));
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);

    const scene1 = initScene();
    scene1.background = loader.load("../../public/images/sky2/nx.png")

    const scene2 = initScene();

    const light = initDirectionLight();
    light.position.set(20, 20, 20);
    light.target = scene2;

    scene2.add(light);
    scene2.add(new AmbientLight());

    initGroundPlane(scene2, new Vector2(20, 20));

    const orbitControl = initOrbitControls(camera, renderer.domElement);

    const mesh = new Mesh(new BoxGeometry(5, 4, 3), new MeshStandardMaterial({ color: 0x049ef4, roughness: 0 }));
    mesh.position.set(0, 0, 6);
    mesh.castShadow = true;
    scene2.add(mesh);

    const scene3 = initScene();
    const grid = new GridHelper(10, 10);
    grid.castShadow = true;
    scene3.add(grid);

    const clock = new Clock();

    let needUpdate = false;

    const viewPort0 = {
        render() {
            renderer.render(scene1, camera);
            renderer.render(scene2, camera);
            renderer.render(scene3, camera);
        }
    }

    const viewPort1 = {
        render() {
            renderer.render(scene1, camera);
        }
    }

    const viewPort2 = {
        render() {
            renderer.render(scene2, camera);
        }
    }

    const viewPort3 = {
        render() {
            renderer.render(scene3, camera);
        }
    }


    const viewPorts = [
        [viewPort0, viewPort1],
        [viewPort2, viewPort3],
    ]



    function update() {
        renderer.clear();
        orbitControl.update();
        matrixRender(viewPorts, renderer);
    }

    function render() {
        const time = clock.getElapsedTime();
        mesh.rotation.x = time * 2;
        mesh.rotation.y = time * 2;
        grid.rotation.z = time * 3;
        needUpdate = true;

        if (needUpdate) {
            update();
        }

        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
}
