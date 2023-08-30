/*
 * @Date: 2023-08-12 17:43:07
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-28 14:04:53
 * @FilePath: /threejs-demo/packages/f-engine/src/helper/src/SelectionHelper.ts
 */

import { BufferGeometry, Mesh, MeshBasicMaterial ,Matrix4} from "three"
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'

const modalMatrix = new Matrix4();
class SelectionHelper extends Mesh {
    constructor(color = '#ffa500') {
       const material = new MeshBasicMaterial({
            color,
            wireframe:true,
            depthTest: false,
        });
        super(new BufferGeometry(), material);

        this.visible = false;
    }

    public setFromObjects(objects: Array<Mesh>) {
        this.geometry.dispose();
        this.visible = false;
        if(objects.length){
            const geometries = objects.map(({ geometry,position,quaternion,scale }) => {  
                geometry.clone().applyMatrix4(modalMatrix.compose(position,quaternion,scale))
                return geometry
            });
            const geometry = mergeGeometries(geometries);
            
            this.geometry = geometry;
            this.visible = true;
        }
    }
}

export { SelectionHelper }