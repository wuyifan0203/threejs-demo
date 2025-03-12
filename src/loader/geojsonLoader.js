/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-03-11 17:57:12
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-12 19:46:18
 * @FilePath: \threejs-demo\src\loader\geojsonLoader.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    Group,
    ExtrudeGeometry,
    Shape,
    MeshStandardMaterial,
    Color,
    LineSegments,
    BufferGeometry,
    LineBasicMaterial,
    Raycaster,
    Vector2,
    Vector3
} from 'three';
import {
    initRenderer,
    initAxesHelper,
    initOrbitControls,
    initScene,
    resize,
    loadJSON,
    HALF_PI,
    initPerspectiveCamera,
    initAmbientLight,
    initDirectionLight,
    vec2ToVec3
} from '../lib/tools/index.js';
import { convertGeoJSON } from '../lib/tools/geoConvert.js';

window.onload = () => {
    init();
};

async function init() {
    const renderer = initRenderer();

    const camera = initPerspectiveCamera(new Vector3(0, 45, 0));
    camera.up.set(1, 0, 0);
    camera.updateProjectionMatrix();

    const scene = initScene();
    initAxesHelper(scene);
    renderer.setClearColor(0x1e90ff, 0.5);

    const controls = initOrbitControls(camera, renderer.domElement);

    initAmbientLight(scene);
    const light = initDirectionLight();
    light.position.set(0, 10, 0);
    scene.add(light);

    function render() {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();
    resize(renderer, camera);

    const json = await loadJSON('../../public/data/province.json');

    const { center } = convertGeoJSON(json);
    console.log('center: ', center);
    const map = new Group();

    const startColor = new Color('#cccccc');
    const endColor = new Color('#045a8d');
    const materials = Array.from({ length: 7 }, (_, k) => {
        return new MeshStandardMaterial({
            color: new Color().lerpColors(startColor, endColor, k / 6)
        })
    });

    const lineMaterial = new LineBasicMaterial({ color: '#ffffff' });
    const heightLightMaterial = new MeshStandardMaterial({ color: '#253494' });

    json.features.map(({ geometry, properties }, i) => {
        geometry.shapes.forEach((points) => {
            const geometry = new ExtrudeGeometry(new Shape(points), {
                bevelEnabled: false
            });
            geometry.translate(-center.x, -center.y, 0);
            geometry.rotateX(HALF_PI);
            geometry.rotateY(-HALF_PI);
            const mesh = new Mesh(geometry, materials[i % 7]);

            const edgeGeometry = new BufferGeometry().setFromPoints(vec2ToVec3(points, 0), lineMaterial);
            edgeGeometry.translate(-center.x, -center.y, 0);
            edgeGeometry.rotateX(HALF_PI);
            edgeGeometry.rotateY(-HALF_PI);
            const edge = new LineSegments(edgeGeometry, lineMaterial);

            mesh.add(edge);
            mesh.userData = { ...properties };
            mesh.userData.material = mesh.material;
            map.add(mesh);
        })
    });
    map.scale.set(0.2, 0.2, 0.2);

    scene.add(map);

    // click event
    const raycaster = new Raycaster();
    const mouse = new Vector2();
    const intersects = [];
    renderer.domElement.addEventListener('mousemove', ({ clientX, clientY }) => {
        intersects.length = 0;
        mouse.x = (clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(clientY / renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        raycaster.intersectObjects(map.children, false, intersects);
        map.children.forEach((object) => {
            object.material = object.userData.material;
        });
        if (intersects.length > 0) {
            intersects[0].object.material = heightLightMaterial;

            console.log('intersects[0].object.userData.name: ', intersects[0].object.userData.name);
        }
    });
}

