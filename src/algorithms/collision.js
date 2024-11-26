/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-25 17:01:48
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-26 13:31:25
 * @FilePath: \threejs-demo\src\algorithms\collision.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { Box3, Mesh, Raycaster, Vector3, Ray, Triangle } from "../lib/three/three.module.js";

const directions = [
    new Vector3(1, 0, 0), // +x
    new Vector3(-1, 0, 0), // -x
    new Vector3(0, 1, 0), // +y
    new Vector3(0, -1, 0), // -y
    new Vector3(0, 0, 1), // +z
    new Vector3(0, 0, -1), // -z
]

const ray = new Raycaster();

const _boxA = new Box3();
const _boxB = new Box3();
const _triangle = new Triangle();

const tmpV = new Vector3();

const _edge1 = new Vector3();
const _edge2 = new Vector3();
const _normal = new Vector3();
const _diff = new Vector3();

class ExtendedRay extends Ray {
    constructor(origin, direction) {
        super(origin, direction);
        this.origin = origin;
        this.direction = direction;
    }

    intersectsTriangle(triangle) {
        _edge1.subVectors(triangle.b, triangle.a);
        _edge2.subVectors(triangle.c, triangle.a);
        _normal.crossVectors(_edge1, _edge2);

        // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
        // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
        //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
        //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
        //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)

        let DdN = this.direction.dot(_normal);
        let sign;

        if (DdN > 0) {
            sign = 1;
        } else if (DdN < 0) {
            sign = -1;
            DdN = -DdN;
        } else {
            return false;
        }

        _diff.subVectors(this.origin, triangle.a);
        const DdQxE2 = sign * this.direction.dot(_edge2.crossVectors(_diff, _edge2));

        // b1 < 0, no intersection
        if (DdQxE2 < 0) {
            return false;
        }

        const DdE1xQ = sign * this.direction.dot(_edge1.cross(_diff));

        // b2 < 0, no intersection
        if (DdE1xQ < 0) {
            return false;
        }

        // b1+b2 > 1, no intersection
        if (DdQxE2 + DdE1xQ > DdN) {
            return false;
        }

        // Line intersects triangle, check if ray does.
        const QdN = -sign * _diff.dot(_normal);

        // t < 0, no intersection
        if (QdN < 0) {
            return false;
        }

        return true;
    }
}


/**
 * @description:  判断meshA是否包含meshB
 * @param {*} meshA Mesh A 
 * @param {*} meshB Mesh B
 * @return {*}
 */
function isContain(meshA, meshB) {
    _boxA.setFromObject(meshA);
    _boxB.setFromObject(meshB);

    if (_boxA.containsBox(_boxB)) {

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
/**
 * @description: 判断点是否在mesh的内部
 * @param {Vector3} point
 * @param {Mesh} mesh
 * @return {boolean}
 */
function isPointInsideGeometry(point, mesh) {

    return directions.every(direction => {
        tmpSet.clear();
        ray.set(point, direction);
        const intersections = ray.intersectObject(mesh, false);

        intersections.forEach(({ distance }) => {
            tmpSet.add(distance);
        })

        return tmpSet.size % 2 === 1;
    })
}

export { isContain, isPointInsideGeometry }