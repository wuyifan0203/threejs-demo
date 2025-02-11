import { SimplexNoise } from '../lib/custom/SimplexNoise.js';

self.onmessage = function (e) {
    console.log('借到消息');
    const { x: sizeX, y: sizeY, z: sizeZ } = e.data.size;

    const n = new SimplexNoise(self.Math);
    const { round, sign, abs, random } = self.Math;
    const data = new Float32Array(sizeX * sizeY * sizeZ * 4);

    const cell = sizeX * sizeY;
    let height = 0;
    let factor = 0;
    const [boundZ, boundY, boundX] = [sizeZ - 1, sizeY - 1, sizeZ - 1];
    const [boundOffsetZ, boundOffsetY, boundOffsetX] = [sizeZ - 2, sizeY - 2, sizeZ - 2];
    for (let z = 0; z < sizeZ; z++) {
        for (let x = 0; x < sizeX; x++) {
            // 通过多次叠加不同频率的噪声来生成地形高度
            // for (let i = 0; i < 3; i++) {
            //     const iSquare = 2 ** i;
            //     height += 10 / iSquare * noise(z * 0.01 * iSquare, x * 0.01 * iSquare);
            // }
            // 优化一下 ，iSquare值恒等于1,2,4，只有x,z是变量，作为常数求累加

            height = 0.1 * n.noise(z * 0.01, x * 0.01) + 0.2 * n.noise(z * 0.02, x * 0.02) + 0.4 * n.noise(z * 0.04, x * 0.04);
            height = round(height);

            for (let y = 0; y < sizeY; y++) {
                const idx = (z * cell + y * sizeX + x) * 4;
                // 排除边界
                if (!(z === 0 || z === boundZ || x === 0 || x === boundX || y === 0 || y === boundY)) {
                    // 通过多次叠加不同频率的噪声来生成洞穴因子
                    // let caveFactor = 0;
                    // for (let i = 0; i < 4; i++) {
                    //     caveFactor += 1 / (2 ** i) * noise.simplex3(x * 0.02 * (2 ** i), y * 0.02 * (2 ** i), z * 0.02 * (2 ** i));
                    // }
                    // 优化一下 ，iSquare值恒等于1,2,4，8,只有x,z是变量，作为常数求累加
                    let caveFactor = n.noise3d(x * 0.02, y * 0.02, z * 0.02) + 0.5 * n.noise3d(x * 0.04, y * 0.04, z * 0.04) + 0.25 * n.noise3d(x * 0.08, y * 0.08, z * 0.08) + 0.125 * n.noise3d(x * 0.16, y * 0.16, z * 0.16);
                    // 对洞穴因子进行处理，生成0或1,0表示当前地点没有洞穴（或是地面部分）,1 表示当前地点是洞穴的一部分（或有洞穴的存在）。
                    caveFactor = sign(round(caveFactor + 1.125));

                    // 根据地缘位置，对洞穴因子进行处理，
                    if (
                        (height < 0 && y >= 50 + height) ||
                        (y < 5 + abs(height)) ||
                        (x <= 1 || x >= boundOffsetX) ||
                        (z <= 1 || z >= boundOffsetZ)
                    ) {
                        caveFactor = 1;
                    }

                    if (y < 53 + height && y >= 50 + height) {
                        // 草地
                        factor = 0.5 + 0.5 * random()
                        data[idx] = 0;
                        data[idx + 1] = factor;
                        data[idx + 2] = 0;
                        data[idx + 3] = 1 * caveFactor;
                    } else if (y >= 43 + height && y <= 50 + height) {
                        // 泥土
                        factor = 0.75 + 0.5 * random()
                        data[idx] = (161 / 255) * factor;
                        data[idx + 1] = (103 / 255) * factor;
                        data[idx + 2] = (60 / 255) * factor;
                        data[idx + 3] = 2 * caveFactor;
                    } else if (y < 43 + height) {
                        // 石头
                        factor = 0.5 + 0.25 * random();
                        data[idx] = factor;
                        data[idx + 1] = factor;
                        data[idx + 2] = factor;
                        data[idx + 3] = 3 * caveFactor;
                    }
                    // 填充水，为空且上方不是空气
                    if (y < 50 && data[idx + 3] === 0 && data[idx + 3 - sizeX * 4] !== 0) {
                        factor = 0.5 + 0.25 * random();
                        data[idx] = factor * 0.25;
                        data[idx + 1] = factor * 0.5;
                        data[idx + 2] = factor;
                        data[idx + 3] = 4 * caveFactor;
                    }
                }
            }
        }
    }

    // const data = new Float32Array();

    postMessage(data);

}