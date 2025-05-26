/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-04-29 15:09:33
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-05-26 09:56:24
 * @FilePath: \threejs-demo\src\occt\useWorker.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    BufferGeometry,
    Float32BufferAttribute,
    LineBasicMaterial,
    LineSegments,
    Raycaster,
    Vector2,
    MeshMatcapMaterial,
    Color,
    Box3,
    Vector3
} from "three";
import {
    initRenderer,
    initCustomGrid,
    initOrbitControls,
    initScene,
    initGUI,
    resize,
    gridPositions,
    TWO_PI,
    initLoader,
    Image_Path,
    initFog,
    initPerspectiveCamera
} from "../lib/tools/index.js";
import { OpenCascadeHelper } from "../lib/tools/openCascadeHelper.js";

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initPerspectiveCamera(new Vector3(20, 14, 12));
    camera.up.set(0, 0, 1);
    camera.far = 500;
    camera.zoom = 2.4;
    camera.updateProjectionMatrix();

    const scene = initScene();
    scene.background = new Color(0x222222);
    initCustomGrid(scene);

    const mouse = new Vector2();
    const raycaster = new Raycaster();

    const controls = initOrbitControls(camera, renderer.domElement);
    controls.target.set(0.5, -2, -0.15);

    const loader = initLoader();
    const texture = loader.load(`../../${Image_Path}/others/metal.png`);

    const list = {
        Box: {
            xSpan: 2,
            ySpan: 2,
            zSpan: 2,
        },
        Sphere: {
            radius: 1,
        },
        Cylinder: {
            radius: 1,
            height: 2,
            angle: TWO_PI,
        },
        Cone: {
            radius1: 0.7,
            radius2: 1,
            height: 2,
            angle: TWO_PI,
        },
        Tours: {
            outerRadius: 1,
            innerRadius: 0.7,
            startAngle: 0,
            endAngle: TWO_PI,
        },
    };

    const deviation = {
        line: 0.1,
        angle: 0.3,
    };

    const material = new MeshMatcapMaterial({
        color: 0xf5f5f5,
        matcap: texture,
    });
    const lineMaterial = new LineBasicMaterial({ vertexColors: true });
    const meshMap = {};
    const lineMap = {};

    const worker = new Worker(new URL("./baseShape.worker.js", import.meta.url), { type: "module", });

    const box = new Box3();
    let fogDistance = 0;

    const workerFunctionMap = {
        init() {
            worker.postMessage({ type: "init", payload: { list, deviation } });
        },
        generate(payload) {
            const { type, result } = payload;
            const buffer = OpenCascadeHelper.convertBufferAttribute(result.faceList);
            const edgeBuffer = OpenCascadeHelper.convertEdgeBufferAttribute(result.edgeList);

            const line = lineMap[type] === undefined ? new LineSegments(new BufferGeometry(), lineMaterial) : lineMap[type];
            const mesh = meshMap[type] === undefined ? new Mesh(new BufferGeometry(), material) : meshMap[type];
            if (meshMap[type]) {
                mesh.geometry.dispose();
                mesh.geometry = new BufferGeometry();
                line.geometry.dispose();
                line.geometry = new BufferGeometry();
            } else {
                scene.add(mesh);
                mesh.add(line);
                meshMap[type] = mesh;
                lineMap[type] = line;
            }
            const geometry = mesh.geometry;
            geometry.setIndex(buffer.indices);
            geometry.setAttribute("position", new Float32BufferAttribute(buffer.position, 3));
            geometry.setAttribute("normal", new Float32BufferAttribute(buffer.normal, 3));
            geometry.setAttribute("uv", new Float32BufferAttribute(buffer.uv, 2));
            geometry.setAttribute("uv2", new Float32BufferAttribute(buffer.uv2, 2));
            geometry.setAttribute("color", new Float32BufferAttribute(buffer.colors, 3));
            geometry.computeBoundingBox();

            const lineGeometry = line.geometry; lineGeometry.setAttribute("position", new Float32BufferAttribute(edgeBuffer.position, 3));
            lineGeometry.setAttribute("color", new Float32BufferAttribute(new Float32Array(edgeBuffer.position.length).fill(0), 3));
            line.userData = {
                indices: edgeBuffer.indices,
                edgeData: edgeBuffer.edgeData,
            };

            Object.values(meshMap).forEach((mesh, i) => {
                const pos = gridPositions(Object.keys(meshMap).length, i, 4);
                mesh.position.copy(pos);
            });

            box.union(geometry.boundingBox);
            fogDistance = Math.max(fogDistance, box.min.distanceTo(box.max) * 1.5);
            initFog(scene, fogDistance, fogDistance + 300, 0x222222);
        },
    };

    worker.onmessage = ({ data }) => {
        console.log("worker -> main: ", data);
        workerFunctionMap[data.type](data.payload);
    };

    worker.onmessageerror = ({ data }) => {
        console.error("worker error: ", data);
    };

    function render() {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);

    function heightLightEdge(lineSegments, index) {
        const edgeIndex = index > 0 ? lineSegments.userData.indices[index] : index;
        const { start, end } = lineSegments.userData.edgeData[edgeIndex];

        const colorAttribute = lineSegments.geometry.getAttribute("color");

        for (let i = 0, l = colorAttribute.array.length; i < l; i++) {
            const index = Math.floor(i / 3);
            colorAttribute.array[i] = index >= start && index <= end ? 1 : 0;
        }
        colorAttribute.needsUpdate = true;
    }

    window.addEventListener("mousemove", (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(Object.values(lineMap), false);

        if (intersects.length > 0) {
            heightLightEdge(intersects[0].object, intersects[0].index);
        } else {
            Object.values(lineMap).forEach((line) => {
                heightLightEdge(line, -1);
            });
        }
    });

    const gui = initGUI();
    gui.add(deviation, "line", 0, 1, 0.01).onFinishChange(() => {
        worker.postMessage({ type: "init", payload: { list, deviation } });
    });
    gui.add(deviation, "angle", 0, 1, 0.01).onFinishChange(() => {
        worker.postMessage({ type: "init", payload: { list, deviation } });
    });

    Object.entries(list).forEach(([name, values]) => {
        const folder = gui.addFolder(name);
        Object.entries(values).forEach(([key, value]) => {
            const k = key.toLowerCase();
            let kf = null;
            if (k.includes("angle")) {
                kf = folder.add(values, key, 0, TWO_PI, 0.1);
            } else {
                kf = folder.add(values, key, 0, 3, 0.01);
            }
            kf.onFinishChange((v) => {
                worker.postMessage({
                    type: "update",
                    payload: { type: name, parameter: values, deviation },
                });
            });
        });
    });
}
