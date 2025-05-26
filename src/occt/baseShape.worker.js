/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-04-30 13:21:38
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-05-23 11:26:04
 * @FilePath: \threejs-demo\src\occt\worker.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { OpenCascadeShape } from '../lib/custom/OpenCascadeShape.js';
import { initOpenCascade } from '../lib/other/opencascade/index.js';
import { OpenCascadeHelper } from '../lib/tools/openCascadeHelper.js';


initOpenCascade().then((occ) => {
    console.log(occ, 'occ init success');
    const och = new OpenCascadeHelper(occ);
    const ocs = new OpenCascadeShape(occ);

    self.postMessage({ type: 'init' });

    self.onmessage = ({ data }) => {
        console.log('main -> worker:', data);
        if (data.type === 'init') {
            const { list, deviation } = data.payload;
            Object.entries(list).forEach(([type, parameter]) => {
                const result = createShape(type, parameter, deviation);
                self.postMessage({ type: 'generate', payload: { type, result } });
            });
        } else if (data.type === 'update') {
            const { type, parameter, deviation } = data.payload;
            const result = createShape(type, parameter, deviation);
            self.postMessage({ type: 'generate', payload: { type, result } });
        }
    }

    function createShape(type, params, deviation) {
        const shape = ocs[type](params);
        const result = och.shape2Buffer(shape, deviation.line, deviation.angle);
        return result;
    }

}).catch((e) => {
    console.error(e);
});
