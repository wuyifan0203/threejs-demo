/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-04-30 13:21:38
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-04-30 17:11:24
 * @FilePath: \threejs-demo\src\occt\base.worker.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { OpenCascadeShape } from '../lib/custom/OpenCascadeShape.js';
import { initOpenCascade } from '../lib/other/opencascade/index.js';
import { OpenCascadeHelper } from '../lib/tools/openCascadeHelper.js';


initOpenCascade().then((occ) => {
    console.log(occ, 'occ init success');
    OpenCascadeHelper.setOpenCascade(occ);
    OpenCascadeShape.setOpenCascade(occ);

    self.postMessage({ init: true });

    self.onmessage = ({ data }) => {
        Object.entries(data.list).forEach(([type, parameter]) => {
            console.log('type, params: ', type, parameter);
            const shape = OpenCascadeShape[type](parameter);
            const result = OpenCascadeHelper.convertBuffer(shape);

            const positionCopy = result.position.slice();
            const normalCopy = result.normal.slice();

            self.postMessage(
                {
                    positions: positionCopy,
                    normals: normalCopy
                },
                [positionCopy.buffer, normalCopy.buffer]);
        });
    }

}).catch((e) => {
    console.error(e);
});
