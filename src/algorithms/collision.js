/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-25 17:01:48
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-25 18:25:52
 * @FilePath: \threejs-demo\src\algorithms\collision.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { Box3, Raycaster, Vector3 } from "../lib/three/three.module.js";

const directions = [
    new Vector3(1, 0, 0), // +x
    new Vector3(-1, 0, 0), // -x
    new Vector3(0, 1, 0), // +y
    new Vector3(0, -1, 0), // -y
    new Vector3(0, 0, 1), // +z
    new Vector3(0, 0, -1), // -z
]

const ray = new Raycaster();

const boxA = new Box3();
const boxB = new Box3();

const tmpV = new Vector3();


/**
 * @description:  判断meshA是否包含meshB
 * @param {*} meshA Mesh A 
 * @param {*} meshB Mesh B
 * @return {*}
 */
function containTest(meshA, meshB) {
    boxA.setFromObject(meshA);
    boxB.setFromObject(meshB);

    if (boxA.containsBox(boxB)) {

        const posSet = new Set();
        const positionBuffer = meshB.geometry.attributes.position;
        const matrixWorld = meshB.matrixWorld;

        for (let j = 0, k = positionBuffer.count; j < k; j++) {
            tmpV.fromBufferAttribute(positionBuffer, j).applyMatrix4(matrixWorld);

            const key = `${tmpV.x},${tmpV.y},${tmpV.z}`;
            if (!posSet.has(key)) {
                posSet.add(key);

                if (!isPointInsideGeometry(tmpV, meshA)) {
                    return false
                }
            }
        }
        return true
    } else {
        return false
    }
}


const tmpSet = new Set();
function isPointInsideGeometry(point, mesh) {

    return directions.every(direction => {
        tmpSet.clear();
        ray.set(point, direction);
        const intersections = ray.intersectObject(mesh, false);

        intersections.forEach(({ distance }) => {
            tmpSet.add(distance);
        })

        console.log(tmpSet.size, 'size');

        console.log(tmpSet.size % 2 === 1);
        


        return tmpSet.size % 2 === 1;
    })
}

export { containTest, isPointInsideGeometry }