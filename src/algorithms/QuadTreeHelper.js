/*
 * @Date: 2024-01-16 20:54:38
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-17 15:34:11
 * @FilePath: /threejs-demo/src/algorithms/QuadTreeHelper.js
 */
import { BufferGeometry, LineBasicMaterial, LineSegments, Vector2, Float32BufferAttribute } from "../lib/three/three.module.js";


const keys = ['lu', 'ru', 'ld', 'rd'];
const _size = new Vector2();
const _center = new Vector2();

class QuadTreeHelper extends LineSegments {
    constructor(quadTree) {
        const material = new LineBasicMaterial({ color: 'red' });
        const geometry = new BufferGeometry();
        super(geometry, material);
        // 设置四叉树对象
        this.quadTree = quadTree;
        // 更新四叉树边界框
        this.update();
    }

    update() {

        const { max, min } = this.quadTree.boundBox;
        const position = [
            max.x, max.y, 0,
            max.x, min.y, 0,
            max.x, min.y, 0,
            min.x, min.y, 0,
            min.x, min.y, 0,
            min.x, max.y, 0,
            min.x, max.y, 0,
            max.x, max.y, 0
        ]

        traverse(this.quadTree, (node) => {
            if(node.divided){
                node.boundBox.getSize(_size);
                node.boundBox.getCenter(_center);
                const [cx, cy, hw, hh] = [_center.x, _center.y, _size.x / 2, _size.y / 2]
    
                position.push(cx - hw, cy, 0, cx + hw, cy, 0);
                position.push(cx, cy - hh, 0, cx, cy + hh, 0);
            }
   
        })

        this.geometry.dispose();
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(position, 3));
        this.geometry = geometry;

    }


}

const traverse = (node, callback) => {
    callback(node);
    for (const key of keys) {
        node[key] && traverse(node[key], callback);
    }
}

export { QuadTreeHelper }