/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-05-26 14:07:53
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-05-26 17:23:39
 * @FilePath: \threejs-demo\src\occt\face.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Mesh,
    BoxGeometry,
    MeshNormalMaterial,
} from 'three';
import {
    initRenderer,
    initOrthographicCamera,
    initCustomGrid,
    initAxesHelper,
    initOrbitControls,
    initScene,
    initGUI,
    resize
} from '../lib/tools/index.js';

window.onload = () => {
    init();
};

function init() {
    const renderer = initRenderer();
    const camera = initOrthographicCamera();
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();

    const scene = initScene();
    initAxesHelper(scene);
    renderer.setClearColor(0xffffff);
    initCustomGrid(scene);

    const controls = initOrbitControls(camera, renderer.domElement);
    const mesh = new Mesh(new BoxGeometry(3, 3, 3), new MeshNormalMaterial());
    scene.add(mesh);

    const worker = new Worker(new URL("./face.worker.js", import.meta.url), { type: "module", });
    
    
    function render() {
        controls.update();

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();

    resize(renderer, camera);
    const gui = initGUI();
}

//
//
//           8---------7
//         / |       / |
//       5---------6  |
//       |   |     |  |
//       |   4-----|--3
//       | /       |/
//       1---------2
//   

function makeBox(width, height, depth) {
    const [hw, hh, hd] = [width / 2, height / 2, depth / 2];
    const p1 = new occ.gp_Pnt(-hw, -hh, -hd);
    const p2 = new occ.gp_Pnt(hw, -hh, -hd);
    const p3 = new occ.gp_Pnt(hw, hh, -hd);
    const p4 = new occ.gp_Pnt(-hw, hh, -hd);
    const p5 = new occ.gp_Pnt(-hw, -hh, hd);
    const p6 = new occ.gp_Pnt(hw, -hh, hd);
    const p7 = new occ.gp_Pnt(hw, hh, hd);
    const p8 = new occ.gp_Pnt(-hw, hh, hd);

    const e12 = new occ.BRepBuilderAPI_MakeEdge(p1, p2);
    const e23 = new occ.BRepBuilderAPI_MakeEdge(p2, p3);
    const e34 = new occ.BRepBuilderAPI_MakeEdge(p3, p4);
    const e41 = new occ.BRepBuilderAPI_MakeEdge(p4, p1);
    const e56 = new occ.BRepBuilderAPI_MakeEdge(p5, p6);
    const e67 = new occ.BRepBuilderAPI_MakeEdge(p6, p7);
    const e78 = new occ.BRepBuilderAPI_MakeEdge(p7, p8);
    const e85 = new occ.BRepBuilderAPI_MakeEdge(p8, p5);
    const e15 = new occ.BRepBuilderAPI_MakeEdge(p1, p5);
    const e26 = new occ.BRepBuilderAPI_MakeEdge(p2, p6);
    const e37 = new occ.BRepBuilderAPI_MakeEdge(p3, p7);
    const e48 = new occ.BRepBuilderAPI_MakeEdge(p4, p8);

    function makeFace(ea, eb, ec, ed) {
        const w = new occ.BRepBuilderAPI_MakeWire();
        w.Add(ea.Edge());
        w.Add(eb.Edge());
        w.Add(ec.Edge());
        w.Add(ed.Edge());
        return new occ.BRepBuilderAPI_MakeFace(w.Wire()).Face();
    }

    const bottom = makeFace(e12, e23, e34, e41);
    const top = makeFace(e56, e67, e78, e85);
    // const left = makeFace(e1, e5, e8, e4);
    // const f4 = makeFace(e2, e6, e7, e3);
    // const f5 = makeFace(e1, e2, e6, e5);
    // const f6 = makeFace(e4, e3, e7, e8);

    const sewer = new occ.BRepBuilderAPI_Sewing();
    sewer.Add(bottom);
    sewer.Add(top);
    // sewer.Add(left);
    // sewer.Add(f4);
    // sewer.Add(f5);
    // sewer.Add(f6);

    sewer.Perform();

    const shape = sewer.SewedShape();

    return shape;
}