/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2025-06-30 00:42:46
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-06-30 01:13:28
 * @FilePath: /threejs-demo/src/occt/importStep.worker.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { initOpenCascade } from '../lib/other/opencascade/index.js';
import { OpenCascadeHelper } from '../lib/tools/openCascadeHelper.js'

initOpenCascade().then((occ) => {
    console.log('occ init success: ', occ);

    const och = new OpenCascadeHelper(occ);

    self.postMessage({ type: 'init' });
    self.onmessage = ({ data }) => {
        const { type, payload } = data;
        if (callbackMap[type]) {
            const response = callbackMap[type](payload);
            response && self.postMessage({ type: response.type, payload: response.payload });
        }
    }

    const callbackMap = {
        importSTEP: ({ arrayBuffer }) => {
            const byteArray = new Uint8Array(arrayBuffer);

            const reader = new occ.STEPControl_Reader_1();
            const fileName = 'test.stp';
            occ.FS.createDataFile('/', fileName, byteArray, true, true);
            const status = reader.ReadFile(fileName);
            console.log('status: ', status);
            if (status === occ.IFSelect_ReturnStatus.IFSelect_RetFail) {
                console.error('read file error');
                return;
            }
            reader.TransferRoots(new occ.Message_ProgressRange_1());
            const shape = reader.OneShape();
            console.log('shape: ', shape);
            const result = och.shape2Buffer(shape);
            console.log('result: ', result);
            // dispose
            reader.delete();
            occ.FS.unlink(fileName);
            shape.delete();
            console.log('dispose');
            return { type: 'build', payload: result }
        }
    };


}).catch((err) => {
    console.error('err: ', err);
})