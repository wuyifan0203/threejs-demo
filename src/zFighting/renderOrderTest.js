/*
 * @Date: 2023-12-18 13:14:01
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-18 14:50:03
 * @FilePath: /threejs-demo/src/zFighting/renderOrderTest.js
 */
import {
    PointLight,
    Mesh,
    BoxGeometry,
    AmbientLight,
    Vector3,
    MeshLambertMaterial,
    DirectionalLight,
    LessDepth,
    OrthographicCamera
} from '../lib/three/three.module.js';
import { OrbitControls } from '../lib/three/OrbitControls.js';
import {
    initCustomGrid,
    initOrthographicCamera,
    initRenderer, initScene, resize,
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer({logarithmicDepthBuffer: true, precision: 'highp' });
    renderer.sortObjects = true;
    const s = 15;
    const h = window.innerHeight;
    const w = window.innerWidth;
  
    const camera = new OrthographicCamera(-s, s, s * (h / w), -s * (h / w), 10, 1000);
    camera.position.copy(new Vector3(100, 100, 100));
    camera.lookAt(new Vector3(0, 0, 0));
  
    window.camera = camera;
    camera.up.set(0, 0, 1);

    const light = new DirectionalLight(0xffffff, 1);
    light.position.copy(camera);



    const scene = initScene();
    const ambientLight = new AmbientLight(0xffffff);
    scene.add(ambientLight);
    scene.add(light);

    initCustomGrid(scene);

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    resize(renderer, camera);

    function render() {
        orbitControls.update();
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        light.position.copy(camera.position);
    }
    render();


    const params  = {
        // depthWrite:false,
        // depthTest:false,
        transparent:true,
    }

    const redMaterial = new MeshLambertMaterial({color: 'red',...params});
    const greenMaterial = new MeshLambertMaterial({ color: 'green' ,...params});
    const blueMaterial = new MeshLambertMaterial({color: 'blue',...params});

    const geometry = new BoxGeometry(1, 1, 1);

    const mesh = new Mesh(geometry, redMaterial);
    mesh.scale.set(10, 5, 2);
    scene.add(mesh);

    const mesh2 = new Mesh(geometry, blueMaterial);
    mesh2.scale.set(10, 10, 0.2);
    mesh2.position.set(0, 0, 0);
    scene.add(mesh2);

    const mesh3 = new Mesh(geometry, greenMaterial);
    mesh3.scale.set(3, 3, 1);
    mesh3.position.set(0, 0, 0.5);
    scene.add(mesh3);

    mesh3.renderOrder = 2
    mesh2.renderOrder = 1
    mesh.renderOrder = 0
}
