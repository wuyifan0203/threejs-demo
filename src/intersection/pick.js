/*
 * @Date: 2024-01-02 10:07:57
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-02 20:32:37
 * @FilePath: /threejs-demo/src/intersection/pick.js
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
    LineSegments
} from '../lib/three/three.module.js'
import {
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

    const box = new BoxGeometry(5, 4, 3);
    const material = new MeshStandardMaterial({ color: 'gray' });

    const mesh = new Mesh(box, material);

    scene.add(mesh);

    //   为null时的Geometry
    const nullGeometry = new BufferGeometry();

    const pointMaterial = new PointsMaterial({ color: 'yellow', size: 10, depthTest: false, transparent: true })
    const heightLightPointsMaterial = new PointsMaterial({ color: 'red', size: 10, depthTest: false, transparent: true })
    const points = new Points(box, pointMaterial);
    const heightLightPoints = new Points(nullGeometry, heightLightPointsMaterial);
    heightLightPoints.renderOrder = 1;

    // const lineMaterial = new LineMaterial({ color: 'yellow', linewidth: 5, depthTest: false, transparent: true });
    // lineMaterial.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    // const lineGeometry = new LineSegmentsGeometry().fromEdgesGeometry(new EdgesGeometry(box))
    // const lineSegments = new LineSegments2(lineGeometry, lineMaterial);

    const lineMaterial = new LineBasicMaterial({ color: 'yellow', depthTest: false, transparent: true });
    const lineGeometry = new EdgesGeometry(box)
    const lineSegments = new LineSegments(lineGeometry, lineMaterial);


    const mouse = new Vector2();

    const raycaster = new Raycaster();

    function render() {
        light.position.copy(camera.position);
        light.position.x = camera.position.x + 10;
        controls.update();
        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(render);

    const gui = initGUI();

    const operation = {
        mode: 'Pick Point'
    }

    const tempPoints = new Vector3();

    window.addEventListener('dblclick', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = (() => {
            console.log(operation.mode);
            switch (operation.mode) {
                case 'Pick Point':
                    return raycaster.intersectObjects([points]);
                case 'Pick Line':
                    return raycaster.intersectObjects([lineSegments]);
                case 'Pick Face':
                    return raycaster.intersectObjects([mesh]);
                default:
                    return raycaster.intersectObjects([mesh]);

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
                tempPoints.fromBufferAttribute(box.getAttribute('position'), index);
                if (lastPoints.length === 0) {
                    // 未初始化
                    lastPoints.push(tempPoints.x, tempPoints.y, tempPoints.z);
                } else {
                    // 初始化过
                    lastPoints = Array.from(lastPoints);
                    lastPoints.push(tempPoints.x, tempPoints.y, tempPoints.z);
                }
                geometry.setAttribute('position', new Float32BufferAttribute(lastPoints, 3));
                heightLightPoints.geometry = geometry;
                scene.add(heightLightPoints);
            } else if (operation.mode === 'Pick Line') {
                const index = intersection.index;
                
                
            }
        } else {
            if (operation.mode === 'Pick Point') {
                heightLightPoints.geometry.dispose();
                heightLightPoints.geometry = nullGeometry;
                scene.remove(heightLightPoints);
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

    switchMode();




}