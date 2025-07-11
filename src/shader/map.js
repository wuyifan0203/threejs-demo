/*
 * @Author: wuyifan wuyifan@udschina.com
 * @Date: 2025-07-11 16:48:39
 * @LastEditors: wuyifan wuyifan@udschina.com
 * @LastEditTime: 2025-07-11 17:20:40
 * @FilePath: \threejs-demo\src\shader\map.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    BoxGeometry,
    MeshNormalMaterial,
    ExtrudeGeometry,
    Shape,
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
    initAxesHelper,
    initOrbitControls,
    initScene,
    initGUI,
    resize,
    loadJSON
} from '../lib/tools/index.js';
import { convertGeoJSON } from '../lib/tools/geoConvert.js';

window.onload = () => {
    init();
};

async function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera();
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const scene = initScene();
    initAxesHelper(scene);
    renderer.setClearColor(0xffffff);
    initCustomGrid(scene);

    const dataPath = `../../public/data`;
    const conuntryData = await loadJSON(`${dataPath}/country.json`);
    const provinceData = await loadJSON(`${dataPath}/province.json`);

    const countryGeo = convertGeoJSON(conuntryData);
    console.log('countryGeo: ', conuntryData);
    const provinceGeo = convertGeoJSON(provinceData);
    console.log('provinceGeo: ', provinceData);

    const controls = initOrbitControls(camera, renderer.domElement);
    const mesh = new Mesh(new BoxGeometry(3, 3, 3), new MeshNormalMaterial());
    scene.add(mesh);

    const material = new MeshNormalMaterial();

    provinceData.features.forEach((province) => {
        console.log(6);
        province.geometry.shapes.forEach((points) => {
            console.log('points: ', points);
            const geometry = new ExtrudeGeometry(new Shape(points));
            const mesh = new Mesh(geometry, material);
            mesh.userData = province.properties;
            scene.add(mesh);
        })
    })


    function render() {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
    const gui = initGUI();
}