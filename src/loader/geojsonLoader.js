/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-03-11 17:57:12
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-18 11:24:13
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
    Vector3,
    Sprite,
    SpriteMaterial,
    CanvasTexture,
} from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js'
import {
    initRenderer,
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
    renderer.setClearColor(0x1e90ff, 0.5);

    const controls = new MapControls(camera, renderer.domElement);

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
    const map = new Group();

    const startColor = new Color('#cccccc');
    const endColor = new Color('#045a8d');
    const materials = Array.from({ length: 7 }, (_, k) => {
        return new MeshStandardMaterial({color: new Color().lerpColors(startColor, endColor, k / 6)})
    });

    const lineMaterial = new LineBasicMaterial({ color: '#ffffff' });
    const heightLightMaterial = new MeshStandardMaterial({ color: '#253494' });

    json.features.map(({ geometry, properties }, i) => {
        geometry.shapes.forEach((points) => {
            const geometry = new ExtrudeGeometry(
                new Shape(points), 
                {bevelEnabled: false}
            );
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


    const marker = createMarker();
    scene.add(marker);

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
            const { object, point } = intersects[0];
            object.material = heightLightMaterial;
            marker.visible = true;
            marker.updateMarker(object, point);
        } else {
            marker.visible = false;
        }
    });
}

function createMarker() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = '15px Arial';
    const padding = 20;
    const baseHeight = 30;

    canvas.height = baseHeight;

    const marker = new Sprite(new SpriteMaterial({ map: new CanvasTexture(canvas) }));
    marker.position.set(0, 2, 0);

    marker.updateMarker = function (object, point) {
        const { name } = object.userData;
        const requestWidth = ctx.measureText(name).width + padding;

        if (canvas.width !== requestWidth || canvas.height !== baseHeight) {
            canvas.width = requestWidth;
            canvas.height = baseHeight; // 必须同步设置高度[1](@ref)

            // 上下文重置补偿
            ctx.font = '15px Arial';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            marker.material.map.dispose();
            marker.material.map = new CanvasTexture(canvas); // 更新材质引用
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textBaseline = 'middle'; // 垂直居中
        ctx.fillStyle = '#000000';
        ctx.fillText(name, padding / 2, canvas.height / 2);

        marker.scale.set(canvas.width / 20, canvas.height / 20, 1); // 按比例缩放
        marker.material.map.needsUpdate = true;

        marker.position.set(point.x, 2, point.z)

    }
    return marker
}
