/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-06-27 17:59:07
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-08-06 17:23:53
 * @FilePath: \threejs-demo\src\lib\tools\constant.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */

import { Vector3, Vector2 } from "three";

const Public_Path = "public";
const Model_Path = `${Public_Path}/models`;
const Image_Path = `${Public_Path}/images`;
const Audio_Path = `${Public_Path}/audio`;

const PI = Math.PI;
const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI / 2;
const QUARTER_PI = Math.PI / 4;

const ZERO3 = new Vector3();
const ZERO2 = new Vector2();

const DIRECTION = {
    'POSX': new Vector3(1, 0, 0),
    'NEGX': new Vector3(-1, 0, 0),
    'POSY': new Vector3(0, 1, 0),
    'NEGY': new Vector3(0, -1, 0),
    'POSZ': new Vector3(0, 0, 1),
    'NEGZ': new Vector3(0, 0, -1),
};

export {
    Public_Path,
    Model_Path,
    Image_Path,
    Audio_Path,
    PI,
    TWO_PI,
    HALF_PI,
    QUARTER_PI,
    ZERO3,
    ZERO2,
    DIRECTION
};
