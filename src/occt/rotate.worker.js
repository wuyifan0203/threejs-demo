/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-05-13 13:29:38
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-05-23 00:41:22
 * @FilePath: /threejs-demo/src/occt/rotate.worker.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */


import opencascade from '../lib/other/opencascade/opencascade.wasm.js';
import { OpenCascadeHelper } from '../lib/tools/openCascadeHelper.js';

const messageHandlers = {};
new opencascade({
    locateFile: (path) => {
        if (path.endsWith('.wasm')) {
            return '../lib/other/opencascade/opencascade.wasm.wasm';
        }
        return path;
    }
}).then((opencascade) => {
    self.opencascade = opencascade;
    console.log('opencascade: ', opencascade);

    onmessage = function ({ data }) {
        const response = messageHandlers[data.type](data.payload);
        console.log('response: ', response);
        if (response) postMessage({ type: data.type, payload: response })
    }

    postMessage({ type: 'init' });
})

