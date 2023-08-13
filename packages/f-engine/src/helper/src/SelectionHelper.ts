import { BufferGeometry, Mesh, MeshBasicMaterial, NotEqualStencilFunc } from "three"
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'

/*
 * @Date: 2023-08-12 17:43:07
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-14 00:54:07
 * @FilePath: /threejs-demo/packages/f-engine/src/helper/src/SelectionHelper.ts
 */
class SelectionHelper {
    private selectedMaterial: MeshBasicMaterial;
    private selectMesh: Mesh;
    constructor(color = '#ffa500') {
        this.selectedMaterial = new MeshBasicMaterial({
            color, stencilWrite: true,
            stencilRef: 1,
            stencilFunc: NotEqualStencilFunc
        });

        this.selectMesh = new Mesh(new BufferGeometry(), this.selectedMaterial);
        this.selectMesh.visible = false;
        this.selectMesh.scale.set(1, 1, 1);
        this.selectMesh.frustumCulled = false;
    }

    public setFromObjects(objects: Array<Mesh>) {
        this.selectMesh.geometry.dispose();
        const geometry = mergeGeometries(objects.map(({ geometry }) => geometry));
        this.selectMesh.geometry = geometry;
    }
}

export { SelectionHelper }