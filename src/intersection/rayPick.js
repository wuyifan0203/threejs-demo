/*
 * @Date: 2024-01-02 10:07:57
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-03 13:52:04
 * @FilePath: /threejs-demo/src/intersection/rayPick.js
 */
import {
    BoxGeometry,
    Mesh,
    Vector2,
    Vector3,
    Raycaster,
    MeshStandardMaterial,
    Points,
    PointsMaterial,
    BufferGeometry,
    EdgesGeometry,
    Float32BufferAttribute,
    LineBasicMaterial,
    LineSegments,
    SphereGeometry,
    CylinderGeometry
} from '../lib/three/three.module.js'
import {
    resize,
    initScene,
    initOrbitControls,
    initOrthographicCamera,
    initRenderer,
    initGUI,
    initAmbientLight,
    initDirectionLight
} from '../lib/tools/common.js';
import { LineMaterial } from '../lib/three/LineMaterial.js';
import { LineSegments2 } from '../lib/three/LineSegments2.js';
import { LineSegmentsGeometry } from '../lib/three/LineSegmentsGeometry.js';
import { RaycasterHelper } from '../helper/RaycasterHelper.js'

window.onload = () => {
    init()
}

function init() {
    const renderer = initRenderer();
    renderer.autoClear = false;

    const camera = initOrthographicCamera(new Vector3(20, 20, 20));
    camera.up.set(0, 0, 1);

    const controls = initOrbitControls(camera, renderer.domElement);

    const scene = initScene();

    initAmbientLight(scene);

    const light = initDirectionLight();
    scene.add(light);

    const operation = {
        mode: 'Pick Point',
        geometry: 'box',
    }

    const geometryPool = {
        box: new BoxGeometry(5, 4, 3),
        sphere: new SphereGeometry(2, 32, 32),
        cylinder: new CylinderGeometry(2, 2, 4, 32)
    }
    const material = new MeshStandardMaterial({ color: 'gray' });

    const mesh = new Mesh(geometryPool[operation.geometry], material);

    scene.add(mesh);

    //   为null时的Geometry
    const nullGeometry = new BufferGeometry();

    const pointMaterial = new PointsMaterial({ color: 'yellow', size: 10, depthTest: false, transparent: true })
    const heightLightPointsMaterial = new PointsMaterial({ color: 'red', size: 10, depthTest: false, transparent: true })
    const points = new Points(geometryPool[operation.geometry], pointMaterial);
    const heightLightPoints = new Points(nullGeometry, heightLightPointsMaterial);
    heightLightPoints.renderOrder = 1;

    // const lineMaterial = new LineMaterial({ color: 'yellow', linewidth: 5, depthTest: false, transparent: true });
    // lineMaterial.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    // const lineGeometry = new LineSegmentsGeometry().fromEdgesGeometry(new EdgesGeometry(box))
    // const lineSegments = new LineSegments2(lineGeometry, lineMaterial);

    const lineMaterial = new LineBasicMaterial({ color: 'yellow', depthTest: false, transparent: true });
    const heightLightLinesMaterial = new LineBasicMaterial({ color: 'red', depthTest: false, transparent: true })
    const lineGeometry = new EdgesGeometry(geometryPool[operation.geometry])
    const lineSegments = new LineSegments(lineGeometry, lineMaterial);
    const heightLightLines = new LineSegments(nullGeometry, heightLightLinesMaterial);
    heightLightLines.renderOrder = 1;

    const raycaster = new Raycaster();

    const helper = new RaycasterHelper(raycaster)


    const mouse = new Vector2();



    function render() {
        light.position.copy(camera.position);
        light.position.x = camera.position.x + 10;
        controls.update();
        renderer.render(scene, camera);
        helper.render(renderer, camera);
    }

    renderer.setAnimationLoop(render);

    const gui = initGUI();



    const tempPoints = new Vector3();

    const renderSize = new Vector2();

    window.addEventListener('dblclick', (e) => {
        renderer.getSize(renderSize);
        mouse.x = (e.clientX / renderSize.x) * 2 - 1;
        mouse.y = -(e.clientY / renderSize.y) * 2 + 1;

        console.log(mouse.x, mouse.y);

        raycaster.setFromCamera(mouse, camera);

        const intersects = (() => {
            console.log(operation.mode);
            switch (operation.mode) {
                case 'Pick Point':
                    return raycaster.intersectObject(points);
                case 'Pick Line':
                    return raycaster.intersectObject(lineSegments);
                case 'Pick Face':
                    return raycaster.intersectObject(mesh);
                default:
                    return raycaster.intersectObject(mesh);

            }
        })()

        if (intersects.length > 0) {
            const intersection = intersects[0];
            console.log(intersection);
            const geometry = new BufferGeometry()
            if (operation.mode === 'Pick Point') {
                const index = intersection.index;
                heightLightPoints.geometry.dispose();
                let lastPoints = heightLightPoints.geometry.getAttribute('position')?.array ?? [];
                const positionAttribute = points.geometry.getAttribute('position');
                tempPoints.fromBufferAttribute(positionAttribute, index);
                if (lastPoints.length === 0) {
                    // 未初始化
                } else {
                    // 初始化过
                    lastPoints = Array.from(lastPoints);
                }
                lastPoints.push(tempPoints.x, tempPoints.y, tempPoints.z);
                geometry.setAttribute('position', new Float32BufferAttribute(lastPoints, 3));
                heightLightPoints.geometry = geometry;
                scene.add(heightLightPoints);
            } else if (operation.mode === 'Pick Line') {
                const i = intersection.index;
                const positionAttribute = lineSegments.geometry.getAttribute('position');
                const index = lineSegments.geometry.getIndex();
                const a = index ? index.getX(i) : i;
                const b = index ? index.getX(i + 1) : i + 1;
                heightLightLines.geometry.dispose();
                let lastLines = heightLightLines.geometry.getAttribute('position')?.array ?? [];

                if (lastLines.length === 0) {
                    // 未初始化
                } else {
                    // 初始化过
                    lastLines = Array.from(lastLines);
                }
                tempPoints.fromBufferAttribute(positionAttribute, a);
                lastLines.push(tempPoints.x, tempPoints.y, tempPoints.z);
                tempPoints.fromBufferAttribute(positionAttribute, b);
                lastLines.push(tempPoints.x, tempPoints.y, tempPoints.z);

                geometry.setAttribute('position', new Float32BufferAttribute(lastLines, 3));
                heightLightLines.geometry = geometry;
                scene.add(heightLightLines);
            }
        } else {
            if (operation.mode === 'Pick Point') {
                heightLightPoints.geometry.dispose();
                heightLightPoints.geometry = nullGeometry;
                scene.remove(heightLightPoints);
            } else if (operation.mode === 'Pick Line') {
                heightLightLines.geometry.dispose();
                heightLightLines.geometry = nullGeometry;
                scene.remove(heightLightLines);
            }
        }

    })

    function switchMode() {
        switch (operation.mode) {
            case 'Normal':
                mesh.material.transparent = false;
                mesh.material.opacity = 1;
                mesh.material.emissive.setHex(0x000000);
                scene.remove(points);
                scene.remove(lineSegments)
                break;
            case 'Pick Point':
                mesh.material.transparent = true;
                mesh.material.opacity = 0.5;
                mesh.material.side = 2
                mesh.material.needsUpdate = true;
                scene.add(points);
                scene.remove(lineSegments);
                break;
            case 'Pick Line':
                mesh.material.transparent = true;
                mesh.material.opacity = 0.5;
                mesh.material.side = 2
                mesh.material.needsUpdate = true;
                scene.add(lineSegments);
                scene.remove(points);
                break;
            case 'Pick Face':

                break;
        }

    }

    gui.add(operation, 'mode', ['Normal', 'Pick Point', 'Pick Line', 'Pick Face']).onChange(switchMode);
    gui.add(operation, 'geometry', Object.keys(geometryPool)).onChange(() => {
        heightLightLines.geometry.dispose();
        heightLightLines.geometry = nullGeometry;
        heightLightPoints.geometry.dispose();
        heightLightPoints.geometry = nullGeometry;

        mesh.geometry.dispose();
        points.geometry.dispose();
        lineSegments.geometry.dispose();
        mesh.geometry = points.geometry = geometryPool[operation.geometry];
        lineSegments.geometry = new EdgesGeometry(mesh.geometry)


        switchMode()
    })

    switchMode();

    resize(renderer, camera);


}