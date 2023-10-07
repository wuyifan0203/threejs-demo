import {
    BoxGeometry, MeshBasicMaterial, Mesh, Vector3
} from "../../examples/src/lib/three/three.module.js";

/*
 * @Date: 2023-10-07 20:06:10
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-08 01:25:27
 * @FilePath: /threejs-demo/apps/snake/snake.js
 */

const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshBasicMaterial({ color: 0x00ff00 });
const mesh = new Mesh(geometry, material);

const [HP, P] = [Math.PI / 2, Math.PI]

const angle = {
    // origin : {
    // new
    // }
    PosX: {
        NegX: P,
        PosY: HP,
        NegY: -HP
    },
    NegX: {
        PosX: P,
        PosY: -HP,
        NegY: HP
    },
    PosY: {
        PosX: -HP,
        NegX: HP,
        NegY: P
    },
    NegY: {
        PosX: HP,
        PosY: P,
        NegX: -HP
    },
}

class Body {
    constructor() {
        this.main = mesh.clone();
        this.direction = 'PosX';
        this.children = null;
        this.tempPosition = new Vector3();
        this.tempDirection = 'PosX';
    }

    update(direction, position) {
        this.tempPosition.copy(position);
        debugger
        this.tempDirection = this.direction;
        if (direction !== this.direction) {
            this.main.position.set(0, 0, 0);
            this.main.rotateZ(angle[this.direction][direction])
            this.direction = direction;
        }

        this.main.position.copy(position);
        console.log(this.main.position);

        this.children && this.children.update(this.tempDirection, this.tempPosition);
    }
}

const _v =new Vector3();
const xV = new Vector3(1, 0, 0);


class Snake {
    constructor() {
        this.head = new Body();
        this._last = this.head;
        this.speed = 1;
        this.position = new Vector3();
    }

    grow() {
        const body = new Body();
        this._last.children = body;
        const v = this._last.main.position.clone();
        v.x = v.x-1
        body.update(this._last.direction, v);
        this._last = body;
        this.head.main.parent.add(body.main);
    }

    update(direction, t) {
        this.head.main.getWorldPosition(this.position);
        const d =this.speed * t;
        _v.copy(xV).applyQuaternion(this.head.main.quaternion);
        this.position.copy(this.head.main.position).add(_v.multiplyScalar(d));
        console.log('---');
        console.log(this.position);
        this.head.update(direction, this.position);
   
    }
}

export { Snake }

