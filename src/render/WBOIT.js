/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-03-25 10:53:44
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-03-25 13:19:55
 * @FilePath: /threejs-demo/src/render/WBOIT.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    Color,
    FloatType,
    HalfFloatType,
    UnsignedByteType
} from "../lib/three/three.module.js";



class WBOIT {
    constructor(renderer, scene) {
        const gl = renderer.getContext();

        this._oldClearColor = new Color();
        const targetTypes = [FloatType, HalfFloatType, UnsignedByteType];
        const targetGLTypes = [gl.FLOAT, gl.HALF_FLOAT, gl.UNSIGNED_BYTE]
        const targetBuffers = [new Float32Array(4), new Uint16Array(4), new Uint8Array(4)];

        
    }

    render(camera) {
        renderer.render();
    }
}