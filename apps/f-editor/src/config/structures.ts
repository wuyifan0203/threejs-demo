/*
 * @Date: 2023-10-09 20:56:10
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-16 20:12:34
 * @FilePath: /threejs-demo/apps/f-editor/src/config/structures.ts
 */

import { PI2 } from '@/utils/constant';

const Cube = {
    width: 2,
    height: 2,
    depth: 2,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1,
}

const Sphere = {
    radius: 2,
    widthSegments: 36,
    heightSegments: 16,
    phiStart: 0,
    phiLength: PI2,
    thetaStart: 0,
    thetaLength: PI2,
}

const Cylinder = {
    radiusTop: 5,
    radiusBottom: 5,
    height: 5,
    radialSegments: 16,
    heightSegments: 1,
    openEnded: false,
    thetaStart: 0,
    thetaLength: PI2,
}

export { Cube, Sphere, Cylinder } 