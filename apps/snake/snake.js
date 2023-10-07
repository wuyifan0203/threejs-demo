import {
    Group, MeshBasicMaterial, Mesh, Vector3
} from "../../examples/src/lib/three/three.module";

/*
 * @Date: 2023-10-07 20:06:10
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-07 21:04:30
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
        PosX: -HP
    },
}

class Body {
    constructor() {
        this.main = mesh.clone();
        this.direction = 'PosX';
        this.children = null;
        this.tempPosition = new Vector3();
        this.tempDirection = new Vector3();
    }

    update(direction, position) {
        this.tempPosition.copy(this.main.position);
        this.tempDirection = this.direction;
        if (direction !== this.direction) {
            this.main.position.set(0, 0, 0);
            this.main.rotateZ(angle[this.direction][direction])
            this.direction = direction;
        }

        this.main.position.copy(position);
        this.children && this.children.update(this.tempDirection, this.tempPosition);
    }
}

class Snake {
    constructor() {
        this.head = new Body();
        this._last = this.head;
        this.speed = 1;
    }

    grow() {
        const body = new Body();
        this._last.children = body;
        body.update(this._last.direction, this._last.main.position);
        this._last = body;
    }

    update(direction, t) {
        this.head.main.translateX(speed * t)
        this.head.update(direction, this.head.main.getWorldPosition());
    }
}

export { Snake }

