/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-05-26 14:10:52
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-06-23 01:42:57
 * @FilePath: /threejs-demo/src/occt/face.worker.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { initOpenCascade } from '../lib/other/opencascade/index.js';
import { OpenCascadeHelper } from '../lib/tools/openCascadeHelper.js';


initOpenCascade().then((occ) => {
    console.log('occ init success: ', occ);
    const och = new OpenCascadeHelper(occ);

    const messageHandler = {
        makeBox({ width, height, depth }) {
            const shape = makeBox(occ, width, height, depth);
            console.log('shape: ', shape);
            const result = och.shape2Buffer(shape)
            console.log('result: ', result);
            self.postMessage({ type: 'generate', payload: result })
        }
    };

    self.onmessage = ({ data }) => {
        const { type, payload } = data;
        if (messageHandler[type]) {
            messageHandler[type](payload);
        }
    }

    self.postMessage({ type: 'init' })
});

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

function makeBox(occ, width, height, depth) {
    const [hw, hh, hd] = [width / 2, height / 2, depth / 2];
    const p1 = new occ.gp_Pnt_3(-hw, -hh, -hd);
    const p2 = new occ.gp_Pnt_3(hw, -hh, -hd);
    const p3 = new occ.gp_Pnt_3(hw, hh, -hd);
    const p4 = new occ.gp_Pnt_3(-hw, hh, -hd);
    const p5 = new occ.gp_Pnt_3(-hw, -hh, hd);
    const p6 = new occ.gp_Pnt_3(hw, -hh, hd);
    const p7 = new occ.gp_Pnt_3(hw, hh, hd);
    const p8 = new occ.gp_Pnt_3(-hw, hh, hd);

    //   1--------4
    //   |        |
    //   |        |
    //   2-------3

    function makeFace(p1, p2, p3, p4) {
        const w = new occ.BRepBuilderAPI_MakeWire_1();
        const ea = new occ.BRepBuilderAPI_MakeEdge_3(p1, p2);
        const eb = new occ.BRepBuilderAPI_MakeEdge_3(p2, p3);
        const ec = new occ.BRepBuilderAPI_MakeEdge_3(p3, p4);
        const ed = new occ.BRepBuilderAPI_MakeEdge_3(p4, p1); 

        w.Add_1(ea.Edge());
        w.Add_1(eb.Edge());
        w.Add_1(ec.Edge());
        w.Add_1(ed.Edge());
        const face = new occ.BRepBuilderAPI_MakeFace_15(w.Wire(), true).Face();
        return face;
    }

    const bottom = makeFace(p1, p4, p3, p2);
    const top = makeFace(p5, p6, p7, p8);
    const left = makeFace(p1, p5, p8, p4);
    const right = makeFace(p2, p3, p7, p6);
    const front = makeFace(p1, p2, p6, p5);
    const back = makeFace(p3, p4, p8, p7);

    const sewer = new occ.BRepBuilderAPI_Sewing(1e-6, true, true, false, true);
    sewer.Add(bottom);
    sewer.Add(top);
    sewer.Add(left);
    sewer.Add(right);
    sewer.Add(front);
    sewer.Add(back);

    sewer.Perform(new occ.Message_ProgressRange_1());

    const shape = sewer.SewedShape();

    return shape;
}