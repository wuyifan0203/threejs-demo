/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-05-26 14:10:52
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-05-26 14:36:58
 * @FilePath: \threejs-demo\src\occt\face.worker.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { OpenCascadeShape } from '../lib/custom/OpenCascadeShape.js';
import { initOpenCascade } from '../lib/other/opencascade/index.js';
import { OpenCascadeHelper } from '../lib/tools/openCascadeHelper.js';

initOpenCascade().then((occ) => {
    console.log('occ init success: ', occ);
    const och = new OpenCascadeHelper(occ);
    const ocs = new OpenCascadeShape(occ);

    const messageHandler = {

    };

    self.onmessage = ({ data }) => {
        const { type, payload } = data;
        if (messageHandler[type]) {
            messageHandler[type](payload);
        }
    }

    self.postMessage({ type: 'init' })
});