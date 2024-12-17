/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-26 18:12:22
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-12-17 17:31:34
 * @FilePath: \threejs-demo\src\lib\custom\MazeGeometry.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */

import { Maze } from '../custom/Maze.js'
import { BufferGeometry, Vector3, Float32BufferAttribute } from "three";

let [ax, ay, bx, by, cx, cy, dx, dy] = [0, 0, 0, 0, 0, 0, 0, 0];
let [ia, ib, ic, id] = [0, 0, 0, 0];
const [pa, pb, pc, pd] = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
//   --->
//  a-----b
//  |   / |  |
//  |  /  |  |/
//  d-----c


class MazeGeometry extends BufferGeometry {
    constructor(width, height, cellSize) {
        super();
        this.maze = new Maze(width, height, cellSize);
        this.maze.generate(1, 1);
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
    }
    generate(depth) {
        const position = [];
        const uvs = [];

        const indicesTop = [];
        const indicesBottom = [];
        const indicesSides = [];
        let total = 0;

        const topVertex = [];
        const bottomVertex = [];


        const { maze: { grid: data }, cellSize } = this;

        for (let row = 0, j = data.length; row < j; row++) {
            for (let col = 0, k = data[0].length; col < k; col++) {
                if (data[row][col] === 1) {
                    topVertex.push({ x: row, y: col });
                } else {
                    bottomVertex.push({ x: row, y: col });
                }
            }
        }

        topVertex.forEach(({ x, y }) => {
            addFace(x, y, 'top', total, indicesTop);
            total += 4;
        });

        bottomVertex.forEach(({ x, y }) => {
            addFace(x, y, 'bottom', total, indicesBottom);
            total += 4;
        });


        // 用于存储侧墙的位置
        const sideWalls = [];
        // 水平方向检查侧墙
        for (let i = 0, il = data.length; i < il; i++) {
            for (let j = 0, jl = data[i].length - 1; j < jl; j++) {
                if (data[i][j] === 0 && data[i][j + 1] === 1) {
                    sideWalls.push({ row: i, col: j, direction: 'left' });
                } else if (data[i][j] === 1 && data[i][j + 1] === 0) {
                    sideWalls.push({ row: i, col: j, direction: 'right' });
                }
            }
        }

        // 垂直方向检查侧墙
        for (let j = 0, jl = data[0].length; j < jl; j++) {
            for (let i = 0, il = data.length - 1; i < il; i++) {
                if (data[i][j] === 0 && data[i + 1][j] === 1) {
                    sideWalls.push({ row: i, col: j, direction: 'back' });
                } else if (data[i][j] === 1 && data[i + 1][j] === 0) {
                    sideWalls.push({ row: i, col: j, direction: 'front' });
                }
            }
        }

        sideWalls.forEach(({ row, col, direction }, i) => {
            addFace(row, col, direction, total, indicesSides);
            total += 4;
        })

        /**
         * @description: 添加单个面
         * @param {number} x 坐标x
         * @param {number} y 坐标y
         * @param {'top'| 'bottom'|'left'|'right'|'front'|'back'} direction 方向
         * @param {number} offset 索引的偏移量
         * @param {Array<number>} indices 索引数组
         * @return {void}
         */
        function addFace(x, y, direction, offset, indices) {
            [ax, ay, bx, by, cx, cy, dx, dy] = [x, y, x, y + 1, x + 1, y + 1, x + 1, y];

            switch (direction) {
                case 'top':
                    {
                        pa.set(dx * cellSize, depth, dy * cellSize);
                        pb.set(cx * cellSize, depth, cy * cellSize);
                        pc.set(bx * cellSize, depth, by * cellSize);
                        pd.set(ax * cellSize, depth, ay * cellSize);
                    }
                    break;
                case 'bottom':
                    {
                        pa.set(dx * cellSize, 0, dy * cellSize);
                        pb.set(cx * cellSize, 0, cy * cellSize);
                        pc.set(bx * cellSize, 0, by * cellSize);
                        pd.set(ax * cellSize, 0, ay * cellSize);
                    }
                    break;
                case 'back':
                    {
                        const [na, nb] = [ax + 1, bx + 1]
                        pa.set(na * cellSize, depth, ay * cellSize);
                        pb.set(nb * cellSize, depth, by * cellSize);
                        pc.set(nb * cellSize, 0, by * cellSize);
                        pd.set(na * cellSize, 0, ay * cellSize);
                    }
                    break;
                case 'front':
                    {
                        pa.set(cx * cellSize, depth, cy * cellSize);
                        pb.set(dx * cellSize, depth, dy * cellSize);
                        pc.set(dx * cellSize, 0, dy * cellSize);
                        pd.set(cx * cellSize, 0, cy * cellSize);
                    }
                    break;
                case 'left':
                    {
                        const [nd, na] = [dy + 1, ay + 1]
                        pa.set(dx * cellSize, depth, nd * cellSize);
                        pb.set(ax * cellSize, depth, na * cellSize);
                        pc.set(ax * cellSize, 0, na * cellSize);
                        pd.set(dx * cellSize, 0, nd * cellSize);
                    }
                    break;
                case 'right':
                    {
                        pa.set(bx * cellSize, depth, by * cellSize);
                        pb.set(cx * cellSize, depth, cy * cellSize);
                        pc.set(cx * cellSize, 0, cy * cellSize);
                        pd.set(bx * cellSize, 0, by * cellSize);
                    }
                    break;
            }

            position.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z, pc.x, pc.y, pc.z, pd.x, pd.y, pd.z);
            [ia, ib, ic, id] = [offset, offset + 1, offset + 2, offset + 3];
            indices.push(ia, id, ib, ic, ib, id);

            uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
        }


        this.addGroup(0, indicesTop.length, 0);   // 顶部
        this.addGroup(indicesTop.length, indicesBottom.length, 1); // 底部
        this.addGroup(indicesTop.length + indicesBottom.length, indicesSides.length, 2);  // 侧墙

        this.setAttribute('position', new Float32BufferAttribute(position, 3));
        this.setIndex([...indicesTop, ...indicesBottom, ...indicesSides]);
        this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
        this.computeVertexNormals();
        this.computeBoundingBox();
        this.computeBoundingSphere();
        this.userData['materialOrder'] = ['top', 'bottom', 'side'];
    }

}

export { MazeGeometry }