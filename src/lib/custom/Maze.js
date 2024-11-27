/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-01 14:41:11
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-20 14:57:45
 * @FilePath: \threejs-demo\src\algorithms\Maze.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
// DFS
class Maze {
    static directions = [
        [-1, 0], // 上
        [1, 0],  // 下
        [0, -1], // 左
        [0, 1]   // 右
    ]
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        // 初始化迷宫矩阵，所有的单元格都设为墙（1）
        this.grid = Array.from({ length: height }, () => Array(width).fill(1));
    }

    // 生成迷宫
    generate(x, y) {
        this.grid[y][x] = 0;
        this.shuffle(Maze.directions);

        for (let [dx, dy] of Maze.directions) {
            const nx = x + dx * 2; // 两个步长，以确保通路间有墙
            const ny = y + dy * 2;
            if (this.inBounds(nx, ny) && this.grid[ny][nx] === 1) {
                this.grid[y + dy][x + dx] = 0;
                this.generate(nx, ny);
            }
        }
    }

    // 判断坐标是否在迷宫范围内
    inBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    // 随机打乱数组
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 设置迷宫入口和出口
    setEntranceAndExit() {
        // 设置左上角为入口
        this.grid[1][0] = 0;
        // 设置右下角为出口
        this.grid[this.height - 2][this.width - 1] = 0;
    }

    // 绘制迷宫
    draw(ctx) {
        ctx.fillStyle = 'black';
        const [width, height] = [this.grid.length, this.grid[0].length];
        console.log(width, height);
        
        ctx.fillRect(0, 0, width * this.cellSize, height * this.cellSize); // 先填充黑色背景
        for (let y = 0; y < width; y++) {
            for (let x = 0; x < height; x++) {
                if (this.grid[y][x] === 0) {
                    ctx.fillStyle = 'white'; // 通路为白色
                    ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }
    }
}

export { Maze }
