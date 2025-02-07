/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-27 15:42:30
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-02-07 16:38:15
 * @FilePath: \threejs-demo\src\lib\custom\AbstractPlayer.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { Vector3 } from "three";

class AbstractPlayer {
    constructor() {
        this.keyMap = {};
        this.direction = new Vector3();
        this.currentSpeed = 0;
    }


    update(dt) {
        this._updateDirection();
        this._updateSpeed(dt);
        this._updatePosition(dt);
    }

    reset() {
        this.currentSpeed = 0;
        this.direction.set(0, 0, 0);
    }

    _updateDirection() {
    }
    _updateSpeed(dt) {
    }
    _updatePosition(dt) {
    }
}

export { AbstractPlayer } 