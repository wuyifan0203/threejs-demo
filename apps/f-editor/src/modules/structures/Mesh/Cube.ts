/*
 * @Date: 2023-09-28 17:54:44
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-08 20:28:30
 * @FilePath: /threejs-demo/apps/f-editor/src/modules/structures/Mesh/Cube.ts
 */
import { BoxGeometry, Mesh } from "three";
import { defaultMaterial } from '@/config/material';
import { Cube as CubeOption } from '@/config/structures';

const _width = CubeOption.width;
const _height = CubeOption.height;
const _depth = CubeOption.depth;
const _widthSegments = CubeOption.widthSegments;
const _heightSegments = CubeOption.heightSegments;
const _depthSegments = CubeOption.depthSegments;

class Cube extends Mesh {
    width = _width;
    height = _height;
    depth = _depth;
    widthSegments = _widthSegments;
    heightSegments = _heightSegments;
    depthSegments = _depthSegments;
    public readonly typeName = 'Cube';
    constructor(material = defaultMaterial) {
        const geometry = new BoxGeometry(_width, _height, _depth, _widthSegments, _heightSegments, _depthSegments);
        super(geometry, material);
    }

    updateGeometry(){
        this.geometry.dispose();
        this.geometry = new BoxGeometry(this.width, this.height, this.depth, this.widthSegments, this.heightSegments, this.depthSegments);
    }

    updateMaterial() {
        if(Array.isArray(this.material)){
            this.material.forEach(m => m.needsUpdate = true);
        }else{
            this.material.needsUpdate = true;
        }
    }
}

export { Cube }