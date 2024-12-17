/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-27 15:42:30
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-27 16:34:46
 * @FilePath: \threejs-demo\src\lib\custom\AbstractPlayer.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { Object3D, Vector3 } from "three";

class AbstractPlayer extends Object3D {
    constructor(shape) {
        super();
        this.shape = shape;
        this.actionState = {};
        this.keyState = {};
        this.keyMap = {};
        this.active = true;
        this.velocity = new Vector3();
    }

    clearState() {
        for (const actionKey in this.actionState) {
            this.actionState[actionKey] !== undefined && (this.actionState[actionKey] = false);
        }

        for (const keyName in this.keyState) {
            this.keyState[keyName] !== undefined && (this.keyState[keyName] = false);
        }
    }

    reset() {
        this.clearState();
        this.velocity.set(0, 0, 0);
        this.position.set(0, 0, 0);
        this.rotation.set(0, 0, 0);
        this.scale.set(0, 0, 0);
    }

    keyDown(event) { }
    keyUp(event) { }
    kwyPress(event) { }

    update() { }
}

export { AbstractPlayer } 