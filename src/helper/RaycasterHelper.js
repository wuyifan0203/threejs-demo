/*
 * @Date: 2024-01-03 13:33:28
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-03 15:48:33
 * @FilePath: /threejs-demo/src/helper/RaycasterHelper.js
 */
import { BufferGeometry, Float32BufferAttribute, LineSegments, Vector3, LineBasicMaterial } from "three";

const _origin = new Vector3();
const _end = new Vector3();

class RaycasterHelper extends LineSegments {
    constructor(raycaster) {
        const positionBuffer = new Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', positionBuffer);
        super(geometry, new LineBasicMaterial({ color: 0xffff00 }));
        this.raycaster = raycaster;
    }

    render(renderer, camera) {
        const positionAttribute = this.geometry.getAttribute('position');
        _origin.copy(this.raycaster.ray.origin);
        _end.copy(this.raycaster.ray.direction).multiplyScalar(camera.far - camera.near).add(_origin);
        positionAttribute.setXYZ(0, _origin.x, _origin.y, _origin.z);
        positionAttribute.setXYZ(1, _end.x, _end.y, _end.z);
        positionAttribute.needsUpdate = true;

        renderer.render(this, camera);
    }
}

export { RaycasterHelper };