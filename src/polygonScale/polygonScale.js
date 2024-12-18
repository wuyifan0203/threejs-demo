/*
 * @Date: 2023-06-16 10:23:11
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-10 15:16:33
 * @FilePath: /threejs-demo/packages/examples/polygonScale/polygonScale.js
 */
import {
    Vector3,
    Scene,
    BufferGeometry,
    BufferAttribute,
    PointsMaterial,
    LineBasicMaterial,
    LineLoop,
    Points,
} from 'three';
import {
    initRenderer,
    initAxesHelper,
    initCustomGrid,
    resize,
    initOrthographicCamera,
    isClockWise,
    dataToVec2,
    vec2ToVec3Vertex,
    initViewHelper,
    initOrbitControls
} from '../lib/tools/index.js';
import {data} from './data.js';
import {polygonScale} from './scale.js';
import {GUI} from '../lib/util/lil-gui.module.min.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera(new Vector3(0, 0, 15));
    const scene = initScene();
    renderer.setClearColor(0xffffff);
    renderer.autoClear = false;
    camera.up.set(0, 0, 1);
    resize(renderer, camera);
    initCustomGrid(scene);
    initAxesHelper(scene);

    const orbitControls = initOrbitControls(camera, renderer.domElement);
    const viewHelper = initViewHelper(camera, renderer.domElement);

    const controls = {useData: 'data1'};

    const lineMaterial = new LineBasicMaterial({color: '#000000'});
    const pointMaterial = new PointsMaterial({color: '#ff0000', size: 10});

    const update = () => {
        let useData = dataToVec2(data[controls.useData]);
        useData = isClockWise(useData) ? useData.reverse() : useData;

        for (let i = 0; i < 3; i++) {
            const res = polygonScale(useData, -i);
            console.log(res);
            const dataArray = vec2ToVec3Vertex(res, 0.5);
            console.log(dataArray);
            const buffer = new BufferAttribute(new Float32Array(dataArray), 3);
            const geometry = new BufferGeometry().setAttribute('position', buffer);

            const line = new LineLoop(geometry, lineMaterial);
            const point = new Points(geometry, pointMaterial);
            scene.add(line, point);
        }
    };

    update();

    const gui = new GUI();

    function render() {
        renderer.clear();
        orbitControls.update();
        renderer.render(scene, camera);
        viewHelper.render(renderer);
        requestAnimationFrame(render);
    }

    render();

    window.scene = scene;
}
