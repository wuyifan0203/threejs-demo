/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2024-11-01 14:47:28
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2024-11-27 18:56:09
 * @FilePath: \threejs-demo\src\algorithms\mazeGenerate.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { Maze } from '../lib/custom/Maze.js';
import { initGUI } from '../lib/tools/common.js';

window.onload = () => {
    init();
}

function init() {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    // 获取画布上下文
    const ctx = canvas.getContext('2d');
    // 设置画布的大小以适应屏幕
    canvas.width = canvas.height = Math.min(window.innerWidth, window.innerHeight);

    const params = {
        cellSize: 20,
        generate() {
            // 初始化迷宫
            const cellSize = params.cellSize; // 每个单元格大小，墙体和道路的厚度一致
            const mazeWidth = Math.floor(window.innerWidth / cellSize); // 根据屏幕尺寸调整迷宫宽度
            const mazeHeight = Math.floor(window.innerHeight / cellSize); // 根据屏幕尺寸调整迷宫高度
            const mazeSize = Math.min(mazeWidth, mazeHeight);
            const maze = new Maze(mazeSize, mazeSize, cellSize);
            maze.generate(1, 1);
            // 设置入口和出口
            maze.setEntranceAndExit();
            // 绘制迷宫
            maze.draw(ctx);
        }
    }
    params.generate();

    const gui = initGUI();
    gui.add(params, 'cellSize', 5, 20, 5).onFinishChange(params.generate);
    gui.add(params, 'generate');






}