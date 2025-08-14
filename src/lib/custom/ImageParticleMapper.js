/*
 * @Author: wuyifan 1208097313@qq.com
 * @Date: 2025-08-14 16:51:41
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-08-14 18:06:37
 * @FilePath: \threejs-demo\src\lib\custom\ImageParticleMapper.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */

class ImageParticleMapper {
    static _canvas = document.createElement('canvas');
    static _context = ImageParticleMapper._canvas.getContext('2d');

    /**
     * @param {number} count 生成粒子数
     * @param {number} outputSize 输出尺寸大小，默认100
     * @param {number} size 采样大小，默认512
     * @param {number} threshold 判定为粒子的阈值,默认为0.5，范围[0,1]
     */
    constructor(count, outputSize = 100, size = 512, threshold = 0.5) {
        // 图片数据返回值为0~255，所以反归一化
        this.threshold = threshold * 255;
        this.size = size;
        this.count = count;
        this.outputSize = outputSize;
    }
    #handleData(data) {
        let [r, g, b] = [0, 0, 0];
        const { size, threshold } = this
        const point = [];
        for (let i = 0, l = data.length; i < l; i += 4) {
            [r, g, b] = [data[i], data[i + 1], data[i + 2]]
            if (r > threshold && g > threshold && b > threshold) {
                const index = i / 4;
                const x = (index % size) / size;
                const y = ~~(index / size) / size;
                point.push([x, y]);
            }
        }
        return this.#sample(point);
    }

    #sample(point) {
        const { outputSize, count } = this;
        const target = new Float32Array(count * 4);
        const step = Math.ceil(point.length / count);
        const halfSize = outputSize / 2;
        for (let i = 0, j = 0, l = point.length; i < l && j < target.length; i += step) {
            const [x, y] = point[i];
            target.set([x * outputSize - halfSize, y * outputSize - halfSize, 0, 1], j)
            j += 4;
        }
        return target;
    }

    /**
     * @description: 获取图片数据
     * @param {string } path
     * @return {Promise<Float32Array>}
     */
    getData(path) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = path;
            const { _canvas, _context } = ImageParticleMapper

            image.onload = () => {
                const { width, height } = image;
                _canvas.width = _canvas.height = this.size;
                _context.drawImage(image, 0, 0, width, height, 0, 0, this.size, this.size);
                // 返回rgba数据
                const data = _context.getImageData(0, 0, this.size, this.size, { colorSpace: 'srgb' }).data;
                resolve(this.#handleData(data));
            }
            image.onerror = () => {
                console.error(`Image load fail,path : ${path}`);
                reject(new Error(`Image load fail,path : ${path}`));
            }
        })
    }
}

export { ImageParticleMapper }
