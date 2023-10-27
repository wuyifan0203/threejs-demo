/*
 * @Date: 2023-10-26 14:19:16
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-27 18:00:22
 * @FilePath: /threejs-demo/examples/src/intersection/CustomViewHelper.js
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
    Quaternion,
    Euler
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

const euler = new Euler();

// 这是个角速度
const speed = Math.PI; //Angular velocity

const HP = Math.PI / 2;

const P = Math.PI

class CustomViewHelper extends Object3D {
    constructor(camera, dom) {
        super();

        this.camera = camera;
        this.dom = dom;

        this.animating = false;

        const geometry = new BoxGeometry(2, 2, 2);

        this._camera = new OrthographicCamera(-2, 2, 2, -2, 0, 4);
        this._camera.position.set(0, 0, 2);
        this._camera.up.set(0, 1, 0);
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

        this.dummy = new Object3D();



        this.object = new Mesh(geometry, [posXM, negXM, posYM, negYM, posZM, negZM])
        this.add(this.object);

        this.finishCallback = () => { }

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

            this.prepareAnimationData(normal)

            this.animating = true;
            return true;
        } else {
            return false
        }
    }

    prepareAnimationData(direction) {
        if (posX.equals(direction)) {
            targetPosition.copy(posX);
            euler.set(0, HP, HP);
        } else if (negX.equals(direction)) {
            targetPosition.copy(negX);
            euler.set(0, -HP, -HP);
        } else if (posY.equals(direction)) {
            targetPosition.copy(posY);
            euler.set(-HP, 0, P);
        } else if (negY.equals(direction)) {
            targetPosition.copy(negY);
            euler.set(HP, 0, 0);
        } else if (posZ.equals(direction)) {
            targetPosition.copy(posZ);
            euler.set(0, 0, 0);
        } else if (negZ.equals(direction)) {
            targetPosition.copy(negZ);
            euler.set(P, 0, P);
        } else {
            console.error('ViewHelper: Invalid axis.');
        }

        targetQuaternion.setFromEuler(euler)

        // 球半径
        radius = this.camera.position.distanceTo(this.target);

        // 相机最后的位置
        targetPosition.multiplyScalar(radius).add(this.target);

        // 这是一个假的物体
        this.dummy.position.copy(this.target);

        // 记录初始位置
        this.dummy.lookAt(this.camera.position);
        q1.copy(this.dummy.quaternion);

        // 记录目标位置
        this.dummy.lookAt(targetPosition);
        q2.copy(this.dummy.quaternion);


        /// 然后我猜做差就求出该旋转的角度
    }

    // 更新
    update(deltaTime) {
        // 每次转的角度
        const step = deltaTime * speed;

        // q1向q2转，每次增量为step
        q1.rotateTowards(q2, step);
        // 计算每一步相机的位置
        ///先将其设置为默认位置
        this.camera.position.set(0, 0, 1);
        /// 然后转刚才求出的角度，得到了相机这时的方向
        this.camera.position.applyQuaternion(q1);
        /// 乘半径，回到球坐标系中
        this.camera.position.multiplyScalar(radius);
        /// 将球坐标系移动到之前的中间
        this.camera.position.add(this.target);

        // 计算每一步相机的角度
        this.camera.quaternion.rotateTowards(targetQuaternion, step);

        // console.log('Q',q1.equals(q2));
        // console.log('P',targetPosition.equals(this.camera.position));

        // console.log(targetPosition,this.camera.position);
        // 如果转到目标停止动画
        if (q1.angleTo(q2) === 0) {
            this.animating = false;
            this.finishCallback()
        }


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

export { CustomViewHelper }