/*
 * @Date: 2024-01-13 14:04:02
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-13 16:25:00
 * @FilePath: /threejs-demo/src/algorithms/QuadTree.js
 */
import { Box2, Vector2 } from '../lib/three/three.module.js';
///  --------------
/// |  lu  |  ru  |     lu-> left up
/// |------|-------     ru-> right up
/// |  ld  |  rd  |     ld-> left down
/// |------|-------     rd-> right down
const _size = new Vector2();
const _center = new Vector2();

class QuadTree {
    constructor(boundBox, maxDivideTimes = Number.MAX_SAFE_INTEGER) {
        this.boundBox = boundBox;
        this.maxDivideTimes = maxDivideTimes;
        this.children = [];
        this.divided = false;
        this.times = 0;
        this.parent = null;
    }

    insertBox(box) {
        if (!this.boundBox.containsBox(box)) {
            return false;
        } else {
            if (this.times < this.maxDivideTimes && !this.divided) {
                this.subdivide();
            }

            if (this.lu.insertBox(box)) {
                return true;
            } else if (this.ru.insertBox(box)) {
                return true;
            } else if (this.ld.insertBox(box)) {
                return true;
            } else if (this.rd.insertBox(box)) {
                return true;
            } else {
                this.parent && this.parent.children.push(box);
                return false;
            }
        }
    }

    subdivide() {
        this.boundBox.getSize(_size);
        this.boundBox.getCenter(_center);
        const [hh, hw] = [_size.y / 2, _size.x / 2];
        const { x, y } = _center;

        const luBox = new Box2(new Vector2(x - hw, y), new Vector2(x, y + hh));
        const ldBox = new Box2(new Vector2(x - hw, y - hh), new Vector2(x, y));
        const ruBox = new Box2(new Vector2(x, y), new Vector2(x + hw, y + hh));
        const rdBox = new Box2(new Vector2(x, y - hh), new Vector2(x + hw, y));

        this.lu = new QuadTree(luBox, this.maxDivideTimes);
        this.ld = new QuadTree(ldBox, this.maxDivideTimes);
        this.ru = new QuadTree(ruBox, this.maxDivideTimes);
        this.rd = new QuadTree(rdBox, this.maxDivideTimes);

        this.lu.parent = this.ld.parent = this.ru.parent = this.rd.parent = this;

        this.times++;
        this.divided = true;
    }
}

export { QuadTree }

