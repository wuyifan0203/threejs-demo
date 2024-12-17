/*
 * @Date: 2023-06-10 16:00:40
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-01-12 19:55:51
 * @FilePath: /threejs-demo/src/triangle/delaunayDemo.js
 */
import { Point } from '../lib/other/poly2tri.js';

import {
    Mesh,
    MeshBasicMaterial,
    Vector3,
    BufferGeometry,
    Vector2,
    Shape,
    ShapeGeometry,
    Float32BufferAttribute,
} from 'three';
import {
    initCustomGrid,
    initOrbitControls,
    initOrthographicCamera,
    initRenderer,
    initScene,
    initGUI
} from '../lib/tools/common.js';

window.onload = () => {
    init();
};


function init() {
    const scene = initScene();
    const renderer = initRenderer();
    renderer.setClearColor(0xffffff);
    const camera = initOrthographicCamera(new Vector3(0, 0, 1000));
    camera.up.set(0, 0, 1);

    const orbitControls = initOrbitControls(camera, renderer.domElement);



    const grid = initCustomGrid(scene, 500, 500);

    grid.position.set(0, 0, -0.11);

    function render() {
        orbitControls.update();
        renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(render);



    // 示例用法
    const points = [
        new Vector2(0, 0),
        new Vector2(0, 10),
        new Vector2(10, 10),
        new Vector2(10, 0),
        new Vector2(5, 5),
        new Vector2(6, 4),
        new Vector2(4, 4),
    ];


    const triangles = delaunayTriangulation(points);
    console.log(triangles);

    const shape = new Shape().setFromPoints(points);

    const geometry = new ShapeGeometry(shape, 3);
    const material = new MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    const mesh = new Mesh(geometry, material);
    scene.add(mesh)

    const buffer = [];
    for (let index = 0; index < triangles.length; index++) {
        const triangle = triangles[index];
        triangle.vertices.forEach(v => {
            buffer.push(v.x, v.y, 0);
        })

    }

    console.log(buffer);

    const geometry2 = new BufferGeometry().setAttribute('position', new Float32BufferAttribute(buffer, 3));
    const material2 = new MeshBasicMaterial({ color: 0xff0000, wireframe: true });


    const m = new Mesh(geometry2, material2);

    scene.add(m);
}


// 定义一个边对象
class Edge {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}

// 定义一个三角形对象
class Triangle {
    constructor(p1, p2, p3) {
        this.vertices = [p1, p2, p3];
        this.edges = [new Edge(p1, p2), new Edge(p2, p3), new Edge(p3, p1)];
    }
}

// 检查点是否在三角形外接圆内
function isPointInCircumcircle(point, triangle) {
    const vertices = triangle.vertices;

    const ax = vertices[0].x - point.x;
    const ay = vertices[0].y - point.y;
    const bx = vertices[1].x - point.x;
    const by = vertices[1].y - point.y;
    const cx = vertices[2].x - point.x;
    const cy = vertices[2].y - point.y;

    const det =
        ax * (by * cx - bx * cy) -
        ay * (bx * cx - by * cx) +
        (bx * cy - by * cx) * cx;

    return det > 0;
}

// 获取边的相邻三角形
function getAdjacentTriangle(edge, triangles) {
    for (const triangle of triangles) {
        if (
            hasEdge(triangle, edge.start, edge.end) &&
            !triangle.vertices.includes(edge.start) &&
            !triangle.vertices.includes(edge.end)
        ) {
            return triangle;
        }
    }
    return null;
}

// 判断三角形是否有指定的边
function hasEdge(triangle, start, end) {
    for (const edge of triangle.edges) {
        if (
            (edge.start === start && edge.end === end) ||
            (edge.start === end && edge.end === start)
        ) {
            return true;
        }
    }
    return false;
}

// 执行德劳内三角形剖分
function delaunayTriangulation(points) {
    const triangles = [];

    // 创建一个超级三角形围住所有点
    const minX = Math.min(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxX = Math.max(...points.map((point) => point.x));
    const maxY = Math.max(...points.map((point) => point.y));
    const superTriangle = new Triangle(
        new Point(minX - 1, minY - 1),
        new Point(maxX + 1, minY - 1),
        new Point((minX + maxX) / 2, maxY + 1)
    );
    triangles.push(superTriangle);

    // 逐个插入点生成三角形
    for (const point of points) {
        const badTriangles = [];

        // 找到所有包含点的三角形
        for (const triangle of triangles) {
            if (isPointInCircumcircle(point, triangle)) {
                badTriangles.push(triangle);
            }
        }

        const polygon = [];

        // 找到所有不与其他坏三角形共享边的边界边
        for (const badTriangle of badTriangles) {
            for (const edge of badTriangle.edges) {
                if (!isEdgeShared(edge, badTriangles)) {
                    polygon.push(edge);
                }
            }
        }

        // 删除坏三角形
        for (const badTriangle of badTriangles) {
            const index = triangles.indexOf(badTriangle);
            triangles.splice(index, 1);
        }

        // 根据边界边和点创建新三角形
        for (const edge of polygon) {
            const newTriangle = new Triangle(edge.start, edge.end, point);
            triangles.push(newTriangle);
        }
    }

    // 删除超级三角形相关的三角形
    const superTriangleVertices = superTriangle.vertices;
    triangles.splice(
        triangles.findIndex((triangle) =>
            triangle.vertices.some((vertex) =>
                superTriangleVertices.includes(vertex)
            )
        ),
        1
    );

    return triangles;
}

// 判断边是否与其他三角形共享
function isEdgeShared(edge, triangles) {
    let count = 0;
    for (const triangle of triangles) {
        if (hasEdge(triangle, edge.start, edge.end)) {
            count++;
        }
        if (count > 1) {
            return true;
        }
    }
    return false;
}


