/*
 * @Date: 2023-10-09 20:34:22
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-09 20:54:11
 * @FilePath: /threejs-demo/apps/f-editor/src/modules/structures/Mesh/Cylinder.ts
 */

import { Mesh, CylinderGeometry } from "three";
import { defaultMaterial } from '@/config/material';
import { PI2 } from '@/utils/constant';

const _radiusTop = 5;
const _radiusBottom = 5;
const _height = 5;
const _radialSegments = 16;
const _heightSegments = 1;
const _openEnded = false;
const _thetaStart = 0;
const _thetaLength = PI2;

class Cylinder extends Mesh {
    radiusTop = _radiusTop;
    radiusBottom = _radiusBottom;
    height = _height;
    radialSegments = _radialSegments;
    heightSegments = _heightSegments;
    openEnded = _openEnded;
    thetaStart = _thetaStart;
    thetaLength = _thetaLength;
    public readonly typeName = 'Cube';
    constructor(material = defaultMaterial) {
        const geometry = new CylinderGeometry(_radiusTop, _radiusBottom, _height, _radialSegments, _heightSegments, _openEnded, _thetaStart);
        super(geometry, material);
    }

    updateGeometry() {
        this.geometry.dispose();
        this.geometry = new CylinderGeometry(_radiusTop, _radiusBottom, _height, _radialSegments, _heightSegments, _openEnded, _thetaStart);
    }

    updateMaterial() {
        if (Array.isArray(this.material)) {
            this.material.forEach(m => m.needsUpdate = true);
        } else {
            this.material.needsUpdate = true;
        }
    }
}

export { Cylinder }