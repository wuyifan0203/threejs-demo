import { BufferGeometry, LineBasicMaterial, LineSegments } from "../lib/three/three.module";

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
    }
}