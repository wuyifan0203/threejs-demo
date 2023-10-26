/*
 * @Date: 2023-10-26 14:19:16
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-26 17:38:53
 * @FilePath: /threejs-demo/examples/src/intersection/box.js
 */
import {
    Mesh,
    Object3D,
    Vector4,
    Vector3,
    BoxGeometry,
    OrthographicCamera,
    CanvasTexture,
    Color,
    MeshBasicMaterial,
    Raycaster,
    Vector2,
    Quaternion
} from '../lib/three/three.module.js'

const point = new Vector3();
const mouse = new Vector2();

const colorX = new Color('#ff3653');
const colorY = new Color('#8adb00');
const colorZ = new Color('#2c8fff');

const posXM = getMaterial(colorX, '+X');
const negXM = getMaterial(colorX, '-X');
const posYM = getMaterial(colorY, '+Y');
const negYM = getMaterial(colorY, '-Y');
const posZM = getMaterial(colorZ, '+Z');
const negZM = getMaterial(colorZ, '-Z');

const vpTemp = new Vector4();
const dim = 128;

const raycaster = new Raycaster();

const posX = new Vector3(1, 0, 0);
const negX = new Vector3(-1, 0, 0);
const posY = new Vector3(0, 1, 0);
const negY = new Vector3(0, -1, 0);
const posZ = new Vector3(0, 0, 1);
const negZ = new Vector3(0, 0, -1);

const targetPosition = new Vector3();
const targetQuaternion = new Quaternion();

const q1 = new Quaternion();
const q2 = new Quaternion();
let radius = 0;

class ViewHelper extends Object3D {
    constructor(camera, dom) {
        super();

        this.camera = camera;
        this.dom = dom;

        this.animating = false;

        const geometry = new BoxGeometry(2, 2, 2);

        this._camera = new OrthographicCamera(-2, 2, 2, -2, 0, 4);
        this._camera.position.set(0, 0, 2);
        this._camera.lookAt(0, 0, 0);
        this._camera.up.copy(this.camera.up)
        this._camera.updateProjectionMatrix();

        posXM.map.center.set(0.5, 0.5)
        posXM.map.rotation = Math.PI / 2;
        posXM.map.needsUpdate = true;

        negXM.map.center.set(0.5, 0.5)
        negXM.map.rotation = - Math.PI / 2;
        negXM.map.needsUpdate = true;

        posYM.map.center.set(0.5, 0.5);
        posYM.map.rotation = Math.PI;
        posYM.map.needsUpdate = true;

        this.target = new Vector3();



        this.object = new Mesh(geometry, [posXM, negXM, posYM, negYM, posZM, negZM])
        this.add(this.object);

    }

    // 触发渲染
    render(renderer) {
        this.quaternion.copy(this.camera.quaternion).invert();
        this.updateMatrixWorld();

        const x = this.dom.offsetWidth - dim;

        renderer.clearDepth();

        renderer.getViewport(vpTemp);
        renderer.setViewport(x, 0, dim, dim);


        renderer.render(this, this._camera);


        renderer.setViewport(vpTemp.x, vpTemp.y, vpTemp.z, vpTemp.w);

    }

    //  点击事件
    handelClick(cursorPosition) {
        if (this.animating === true) return false;

        const rect = this.dom.getBoundingClientRect();
        const offsetX = rect.left + (this.dom.offsetWidth - dim);
        const offsetY = rect.top + (this.dom.offsetHeight - dim);
        mouse.x = ((cursorPosition.x - offsetX) / (rect.width - offsetX)) * 2 - 1;
        mouse.y = -((cursorPosition.y - offsetY) / (rect.bottom - offsetY)) * 2 + 1;

        raycaster.setFromCamera(mouse, this._camera);


        const intersects = raycaster.intersectObjects(this.children, false);


        if (intersects.length) {
            const intersection = intersects[0];
            const normal = intersection.normal;

            prepareAnimationData(normal)

            this.animating = true;
            return true;
        } else {
            return false
        }
    }

    prepareAnimationData(direction) {
        if (posX.equals(direction)) {

        } else if (negX.equals(direction)) {

        } else if (posY.equals(direction)) {

        } else if (negY.equals(direction)) {

        } else if (posZ.equals(direction)) {

        } else if (negZ.equals(direction)) {

        } else {
            console.error('ViewHelper: Invalid axis.');
        }


    }

    // 更新
    update(delta) {

    }

    // 销毁
    dispose() {
        this.object.removeFromParent();
        this.object.material.foreach((material) => {
            material.dispose();
            material.map.dispose();
        })
        this.object.geometry.dispose();
    }

}

function getMaterial(color, text = null) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;

    const context = canvas.getContext('2d');
    context.beginPath();
    context.arc(32, 32, 48, 0, 2 * Math.PI);
    context.closePath();
    context.fillStyle = color.getStyle();
    context.fill();

    if (text !== null) {
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillStyle = '#000000';
        context.fillText(text, 32, 41);
    }

    const texture = new CanvasTexture(canvas);

    return new MeshBasicMaterial({ map: texture, toneMapped: false });
}

export { ViewHelper }