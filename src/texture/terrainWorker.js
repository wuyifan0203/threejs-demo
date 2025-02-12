import { SimplexNoise } from '../lib/custom/SimplexNoise.js';

const n = new SimplexNoise(self.Math);
const { round, sign, abs, random, sqrt, floor } = self.Math;

const terrainNoiseWeights = [0.1, 0.2, 0.4];
const terrainNoiseFreq = [0.01, 0.02, 0.04];
const caveNoiseWeights = [1, 0.5, 0.25, 0.125];
const caveNoiseFreq = [0.02, 0.04, 0.08, 0.16];

const MATERIALS = {
    AIR() {
        return { R: 0, G: 0, B: 0, A: 0 }
    },
    GRASS() {
        return {
            R: 0,
            G: 0.5 + 0.5 * random(),
            B: 0,
            A: 1
        }
    },
    DIRT() {
        const factor = 0.75 + 0.5 * random();
        return {
            R: (161 / 255) * factor,
            G: (103 / 255) * factor,
            B: (60 / 255) * factor,
            A: 2
        }
    },
    STONE() {
        const factor = 0.5 + 0.25 * random();
        return {
            R: factor,
            G: factor,
            B: factor,
            A: 3
        }
    },
    WATER() {
        const factor = 0.5 + 0.25 * random();
        return {
            R: factor * 0.25,
            G: factor * 0.5,
            B: factor,
            A: 4
        }
    },
    TRUNK() {
        const factor = 0.25 + 0.75 * random();
        return {
            R: 0.631 * factor,
            G: 0.403 * factor,
            B: 0.235 * factor,
            A: 5
        }
    },
    LEAF() {
        const factor = 0.5 + 0.25 * random();
        return {
            R: factor * 0.25,
            G: factor,
            B: factor * 0.25,
            A: 6
        }
    },
    SAND() {
        const factor = 0.75 + 0.5 * random()
        return {
            R: 0.760 * factor,
            G: 0.698 * factor,
            B: 0.502 * factor,
            A: 7
        }
    },
    GRAVEL() {
        const factor = 0.5 + 0.25 * random();
        return {
            R: factor,
            G: factor,
            B: factor,
            A: 8
        }
    }
};

self.onmessage = function (e) {
    console.log('借到消息');
    const { x: sizeX, y: sizeY, z: sizeZ } = e.data.size;
    const data = new Float32Array(sizeX * sizeY * sizeZ * 4);
    const halfHeight = sizeY / 2;
    const grassRange =  halfHeight + 3;
    const storRange = halfHeight-7;

    const cell = sizeX * sizeY;
    let height = 0;
    let factor = 0;
    const [boundZ, boundY, boundX] = [sizeZ - 1, sizeY - 1, sizeZ - 1];
    const [boundOffsetZ, boundOffsetX] = [sizeZ - 2, sizeZ - 2];
    const upIdx = sizeX * 4;
    for (let z = 0; z < sizeZ; z++) {
        for (let x = 0; x < sizeX; x++) {
            // 通过多次叠加不同频率的噪声来生成地形高度

            height = 0.1 * n.noise(z * 0.01, x * 0.01) + 0.2 * n.noise(z * 0.02, x * 0.02) + 0.4 * n.noise(z * 0.04, x * 0.04);
            height = round(height);

            for (let y = 0; y < sizeY; y++) {
                const idx = (z * cell + y * sizeX + x) * 4;
                // 排除边界
                if (!(z === 0 || z === boundZ || x === 0 || x === boundX || y === 0 || y === boundY)) {
                    // 通过多次叠加不同频率的噪声来生成洞穴因子
                    // 优化一下 ，iSquare值恒等于1,2,4，8,只有x,z是变量，作为常数求累加
                    let caveFactor = n.noise3d(x * 0.02, y * 0.02, z * 0.02) + 0.5 * n.noise3d(x * 0.04, y * 0.04, z * 0.04) + 0.25 * n.noise3d(x * 0.08, y * 0.08, z * 0.08) + 0.125 * n.noise3d(x * 0.16, y * 0.16, z * 0.16);
                    // 对洞穴因子进行处理，生成0或1,0表示当前地点没有洞穴（或是地面部分）,1 表示当前地点是洞穴的一部分（或有洞穴的存在）。
                    caveFactor = sign(round(caveFactor + 1.125));

                    // 根据地缘位置，对洞穴因子进行处理，
                    if (
                        (height < 0 && y >= halfHeight + height) ||
                        (y < 5 + abs(height)) ||
                        (x <= 1 || x >= boundOffsetX) ||
                        (z <= 1 || z >= boundOffsetZ)
                    ) {
                        caveFactor = 1;
                    }

                    if (y < grassRange + height && y >= halfHeight + height) {
                        // 草地
                        factor = 0.5 + 0.5 * random()
                        data.set([0, factor, 0, 1], idx);
                        // data[idx] = 0;
                        // data[idx + 1] = factor;
                        // data[idx + 2] = 0;
                        // data[idx + 3] = 1 * caveFactor;
                    } else if (y >= storRange + height && y <= halfHeight + height) {
                        // 泥土
                        factor = 0.75 + 0.5 * random();
                        data.set([(161 / 255) * factor, (103 / 255) * factor, (60 / 255) * factor, 2], idx);
                        // data[idx] = (161 / 255) * factor;
                        // data[idx + 1] = (103 / 255) * factor;
                        // data[idx + 2] = (60 / 255) * factor;
                        // data[idx + 3] = 2 * caveFactor;
                    } else if (y < storRange + height) {
                        // 石头
                        factor = 0.5 + 0.25 * random();
                        data.set([factor, factor, factor, 3], idx);
                        // data[idx] = factor;
                        // data[idx + 1] = factor;
                        // data[idx + 2] = factor;
                        // data[idx + 3] = 3 * caveFactor;
                    }
                    // 填充水，为空且上方不是空气
                    if (y < halfHeight && data[idx + 3] === 0 && data[idx + 3 - upIdx] !== 0) {
                        factor = 0.5 + 0.25 * random();
                        data.set([factor * 0.25, factor * 0.5, factor, 4], idx);
                        // data[idx] = factor * 0.25;
                        // data[idx + 1] = factor * 0.5;
                        // data[idx + 2] = factor;
                        // data[idx + 3] = 4 * caveFactor;
                    }
                }
            }
        }
    }

    for (let z = 0; z < sizeZ; z++) {
        for (let y = 0; y < sizeY; y++) {
            for (let x = 0; x < sizeX; x++) {
                const idx = (z * cell + y * sizeX + x) * 4;
                // 排除边缘
                if (!(z === 0 || z === boundZ || y === 0 || y === boundY || x === 0 || x === boundX)) {
                    // 处理水面
                    const currentType = data[idx + 3];
                    if (currentType === 4) {
                        // 遍历水周围的元素
                        for (let z_ = -3 + z; z_ <= 3 + z; z_++) {
                            for (let y_ = -1 + y; y_ <= 1 + y; y_++) {
                                for (let x_ = -3 + x; x_ <= 3 + x; x_++) {
                                    const i = (z_ * cell + y_ * sizeX + x_) * 4;
                                    if (!(z_ === 0 || z_ === boundZ || y_ === 0 || y_ === boundY || x_ === 0 || x_ === boundX)) {
                                        const type = i + 3;
                                        // 将草地的状态修改为沙子或石子
                                        if (data[type] === 1) {
                                            if (data[type + upIdx] === 4 && data[type + sizeX * 8] === 4 &&
                                                data[type + sizeX * 12] === 4) {
                                                // 砾石
                                                factor = 0.5 + 0.25 * random();
                                                data.set([factor, factor, factor, 8], idx);
                                                // data[idx] = factor;
                                                // data[idx + 1] = factor;
                                                // data[idx + 2] = factor;
                                                // data[idx + 3] = 8;
                                            } else {
                                                // 沙子
                                                factor = 0.75 + 0.5 * random();
                                                data.set([factor * 0.760, factor * 0.698, factor * 0.502, 7], idx);
                                                // data[i] = 0.760 * factor;
                                                // data[i + 1] = 0.698 * factor;
                                                // data[i + 2] = 0.502 * factor;
                                                // data[i + 3] = 7;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else if (currentType === 2) {
                        // 判定顶部泥土为土地
                        let blocked = false;
                        for (let w = y + 1; w < sizeY; w++) {
                            const i = (z * cell + w * sizeX + x) * 4;
                            if (data[i + 3] !== 0) {
                                blocked = true;
                                break;
                            }
                        }
                        if (!blocked) {
                            data.set([0, 0.5 + 0.5 * random(), 0, 1], idx);
                            // data[idx] = 0;
                            // data[idx + 1] = 0.5 + 0.5 * random();
                            // data[idx + 2] = 0;
                            // data[idx + 3] = 1;
                        }
                    }
                }
            }
        }
    }

    // for (let i = 0, count = round(sqrt(cell)); i < count; i++) {
    //     let randomX = round(6 + random() * (sizeX - 12));
    //     let randomZ = round(6 + random() * (sizeY - 12));
    //     let placeY = 1;
    //     let idx = 0;
    //     // 该位置是否可以放树
    //     for (let y = 1; y < sizeY; y++) {
    //         idx = (randomZ * cell + y * sizeX + randomX) * 4;
    //         // 判断上方是否为空气下方是否为草地
    //         if (data[idx + 3] === 0 && data[idx + 3 - upIdx] === 1) {
    //             placeY = y;
    //             break;
    //         }
    //     }
    //     if (placeY === 1) {
    //         i--;
    //         continue;
    //     }
    //     // 设置成树干
    //     factor = 0.75 + 0.5 * random();
    //     data.set([0.631 * factor, 0.403 * factor, 0.235 * factor, 5], idx);
    //     // data[idx] = 0.631 * factor;
    //     // data[idx + 1] = 0.403 * factor;
    //     // data[idx + 2] = 0.235 * factor;
    //     // data[idx + 3] = 5;
    //     // 树高度
    //     const height = round(4 + random() * 2);
    //     const trunkHue = 0.25 + 0.75 * random();
    //     // 设置树干
    //     for (let i = 1; i <= height; i++) {
    //         factor = (0.75 + 0.5 * random()) * trunkHue;
    //         data.set([0.631 * factor, 0.403 * factor, 0.235 * factor, 5], idx + i * upIdx);
    //         // data[idx + i * upIdx] = 0.631 * factor;
    //         // data[idx + 1 + i * upIdx] = 0.403 * factor;
    //         // data[idx + 2 + i * upIdx] = 0.235 * factor;
    //         // data[idx + 3 + i * upIdx] = 5;
    //     }
    //     // 设置树叶高度
    //     let leafHeight = floor(random() * 3);
    //     let leaf2Height = floor(random() * 2);
    //     let leafHue = 0.25 + 0.75 * random();
    //     for (let z = randomZ - 2; z < randomZ + 3; z++) {
    //         for (let y = (placeY + height + leafHeight) - 2; y < (placeY + height + leafHeight) + 2; y++) {
    //             for (let x = randomX - 2; x < randomX + 3; x++) {
    //                 if (!(z <= 0 || z >= boundZ || y <= 0 || y >= boundY || x <= 0 || x >= boundX)) {
    //                     const idx = (z * cell + y * (sizeX) + x) * 4;
    //                     if (data[idx + 3] !== 5) {
    //                         factor = 0.5 + 0.25 * random();
    //                         factor *= leafHue;
    //                         data.set([factor * 0.25, factor, factor * 0.25, 6], idx);
    //                         // data[idx] = factor * 0.25;
    //                         // data[idx + 1] = factor;
    //                         // data[idx + 2] = factor * 0.25;
    //                         // data[idx + 3] = 6;
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     for (let z = randomZ - 1; z < randomZ + 2; z++) {
    //         for (let y = (placeY + height + leafHeight + leaf2Height) - 2; y < (placeY + height + leafHeight + leaf2Height) + 3; y++) {
    //             for (let x = randomX - 1; x < randomX + 2; x++) {
    //                 if (!(z <= 0 || z >= boundZ || y <= 0 || y >= boundY || x <= 0 || x >= boundX)) {
    //                     const idx = (z * cell + y * (sizeX) + x) * 4;
    //                     if (data[idx + 3] !== 5) {
    //                         let factor = 0.5 + 0.25 * random();
    //                         factor *= leafHue;
    //                         data.set([factor * 0.25, factor, factor * 0.25, 6], idx);
    //                         // data[idx] = factor * 0.25;
    //                         // data[idx + 1] = factor;
    //                         // data[idx + 2] = factor * 0.25;
    //                         // data[idx + 3] = 6;
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }

    postMessage(data);

}

