/*
 * @Date: 2023-10-08 19:18:05
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-08 19:25:25
 * @FilePath: /threejs-demo/apps/f-editor/src/modules/material/DefalutMaterial.ts
 */

import { MeshLambertMaterial, type MeshLambertMaterialParameters } from "three";


class DefaultMaterial extends MeshLambertMaterial {
    constructor(option = { color: 0xbbbbbb }) {
        super(option);
    }
}

export { DefaultMaterial }