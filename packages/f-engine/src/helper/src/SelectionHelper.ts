import { type Mesh, MeshBasicMaterial, NotEqualStencilFunc } from "three"

/*
 * @Date: 2023-08-12 17:43:07
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-12 18:19:18
 * @FilePath: /threejs-demo/packages/f-engine/src/helper/src/SelectionHelper.ts
 */
class SelectionHelper {
    private selectedMaterial: MeshBasicMaterial;
    constructor(color = '#ffa500') {
        this.selectedMaterial = new MeshBasicMaterial({
            color, stencilWrite: true,
            stencilRef: 1,
            stencilFunc: NotEqualStencilFunc
        });
    }

    public setFromObjects(objects:Array<Mesh>){

    }
}

export { SelectionHelper }