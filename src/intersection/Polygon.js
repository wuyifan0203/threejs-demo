/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-04-25 17:27:37
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-04-25 17:56:07
 * @FilePath: /threejs-demo/src/intersection/Polygon.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { Triangle } from 'three'

let triangleId = 0;
class CustomTriangle extends Triangle {
    constructor(a, b, c, ai = 0, bi = 0, ci = 0) {
        super(a, b, c);
        this.id = triangleId++;
        this.index = { a: ai, b: bi, c: ci };
    }

    setFromAttributeAndIndices(buffer, indexA, indexB, indexC) {
        this.index.a = indexA;
        this.index.b = indexB;
        this.index.c = indexC;
        return super.setFromAttributeAndIndices(buffer, indexA, indexB, indexC)
    }

}

let polygonId = 0;
class Polygon {
    constructor(mesh) {
        this.id = polygonId++;
        this.triangles = [];
        this.setFromMesh(mesh);
    }

    setFromMesh(mesh) {
        this.triangles.length = 0;
        const geometry = mesh.geometry.clone();
        geometry.applyMatrix4(mesh.matrixWorld);

        const position = geometry.getAttribute('position');
        if (position !== null) {
            const index = geometry.index;
            if (index !== null) {
                for (let j = 0, k = index.count; j < k; j += 3) {
                    const triangle = new CustomTriangle();
                    triangle.setFromAttributeAndIndices(position, index.getX(j), index.getX(j + 1), index.getX(j + 2));
                    this.triangles.push(triangle);
                }
            } else {
                const posArray = position.array;
                for (let j = 0, k = position.count; j < k; j += 9) {
                    const a = new Vector3(posArray[j], posArray[j + 1], posArray[j + 2]);
                    const b = new Vector3(posArray[j + 3], posArray[j + 4], posArray[j + 5]);
                    const c = new Vector3(posArray[j + 6], posArray[j + 7], posArray[j + 8]);

                    const triangle = new Triangle(a, b, c, j, j + 3, j + 6);
                    this.triangles.push(triangle);
                }
            }
        }
    }

}

export { Polygon, CustomTriangle } 