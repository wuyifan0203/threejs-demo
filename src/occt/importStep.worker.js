/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2025-06-30 00:42:46
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-06-30 01:13:28
 * @FilePath: /threejs-demo/src/occt/importStep.worker.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { initOpenCascade } from '../lib/other/opencascade/index.js';

initOpenCascade().then((occ) => {
    console.log('occ init success: ', occ);
    self.postMessage({ type: 'init' });
    self.onmessage = ({ data }) => {
        const { type, payload } = data;
        if (callbackMap[type]) {
            const response = callbackMap[type](payload);
            response && self.postMessage({ type, payload: response });
        }
    }

    const callbackMap = {
        importSTEP: ({ arrayBuffer }) => {
            console.log('arrayBuffer: ', arrayBuffer);
            const reader = new occ.STEPControl_Reader_1();
            
        }
    };


}).catch((err) => {
    console.error('err: ', err);
})