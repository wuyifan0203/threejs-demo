/*
 * @Date: 2023-09-28 17:54:44
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-08 20:26:19
 * @FilePath: /threejs-demo/apps/f-editor/src/modules/structures/Mesh/Sphere.ts
 */

import { Mesh, SphereGeometry } from "three";
import { defaultMaterial } from '@/config/material'

const _radius = 2;
const _widthSegments = 36;
const _heightSegments = 16;
const _phiStart = 0;
const _phiLength = Math.PI * 2;
const _thetaStart = 0;
const _thetaLength = Math.PI * 2;

class Sphere extends Mesh {
    radius = _radius;
    widthSegments = _widthSegments;
    heightSegments = _heightSegments;
    phiStart = _phiStart;
    phiLength = _phiLength;
    thetaStart = _thetaStart;
    thetaLength = _thetaLength;
    public readonly typeName = 'Cube';
    constructor(material = defaultMaterial) {
        const geometry = new SphereGeometry(_radius, _widthSegments, _heightSegments, _phiStart, _phiLength, _thetaStart, _thetaLength)
        super(geometry, material);
    }

    updateGeometry() {
        this.geometry.dispose();
        this.geometry = new SphereGeometry(this.radius, this.widthSegments, this.heightSegments, this.phiStart, this.phiLength, this.thetaStart, this.thetaLength);
    }

    updateMaterial() {
        if (Array.isArray(this.material)) {
            this.material.forEach(m => m.needsUpdate = true);
        } else {
            this.material.needsUpdate = true;
        }
    }
}

export { Sphere }