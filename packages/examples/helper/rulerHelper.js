import dat from '../../lib/util/dat.gui.js'

function init(params) {
    const dom1 = document.querySelector('#ruler1');
    const dom2 = document.querySelector('#ruler2');
    const dom3 = document.querySelector('#ruler3');
    dom1.append(createRuler(1000, 50))
    function createRuler(width, height) {
        const canvas = document.createElement('canvas');
        canvas.style.display = 'block'
        canvas.style.background = '##ffefd0';
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d");

        // 设定尺子的起点位置和长度
        const x = 50;
        const y = 50;
        const length = 900;

        // 设定尺子的最大刻度数和刻度间隔
        const maxScale = 10;
        const scaleInterval = 1;

        // 设定刻度线的长度和宽度
        const scaleLength = 20;
        const minScaleLength = 10

        // 设定标量文字的字体和大小
        const textFont = "14px Arial";
        ctx.font = textFont;

        // 绘制尺子主体
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + length, y);
        ctx.stroke();

        // 绘制刻度线和标量
        for (let i = 0, max = maxScale * 10; i <= max; i++) {
            const xPos = x + i * length / maxScale / 10; // 计算刻度线的横坐标位置
            ctx.beginPath();
            ctx.moveTo(xPos, height);
            if (i % 10 === 0) {
                ctx.lineTo(xPos, height - scaleLength);
                const text = (i / 10).toString(); // 标量文字为当前刻度值
                const textWidth = ctx.measureText(text).width; // 计算标量文字的宽度
                ctx.fillText(text, xPos - textWidth / 2, height - scaleLength - 10); // 绘制标量文字
            } else {
                if (i % 5 === 0) {
                    ctx.lineTo(xPos, height - minScaleLength - 5);
                } else {
                    ctx.lineTo(xPos, height - minScaleLength);
                }
            }
            ctx.stroke();
        }


        return canvas;
    }

    const controls = {
        ruler2: {
            zero: 450,
            unit: 30,
        },
        ruler3: {
            zeroX: 450,
            zeroY: 200,
            unit: 30,
        }


    }


    let rulerInstance = createRuler2(1000, 50);
    dom2.append(rulerInstance);



    const gui = new dat.GUI();
    const ruler2Folder = gui.addFolder('Ruler2');

    ruler2Folder.add(controls.ruler2, 'zero', -900, 1800, 10).name('zero position').onChange(e => update());
    ruler2Folder.add(controls.ruler2, 'unit', 0.1, 600, 0.01).onChange(e => update());


    const ruler3Folder = gui.addFolder('Ruler3');
    ruler3Folder.add(controls.ruler3, 'zeroX', -900, 1800, 10).name('zeroX position').onChange(e => update2());
    ruler3Folder.add(controls.ruler3, 'zeroY', -900, 1800, 10).name('zeroY position').onChange(e => update2());
    ruler3Folder.add(controls.ruler3, 'unit', 0.1, 600, 0.01).onChange(e => update2());

    function update() {
        dom2.removeChild(rulerInstance)
        rulerInstance = createRuler2(1000, 50);
        dom2.append(rulerInstance);
    }


    function createRuler2(width, height) {
        const canvas = document.createElement('canvas');
        canvas.style.display = 'block'
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d");

        // 常量
        const X = 50; // 尺子的起点位置
        const Y = 50; // 尺子的起点位置
        const lineWidth = 900; //长度
        const [tenHeight, fiveHeeight, oneHeight] = [20, 15, 10];

        const l1 = height - tenHeight;
        const l11 = height - tenHeight - 10;
        const l2 = height - fiveHeeight;
        const l3 = height - oneHeight;
        // 下划线
        ctx.beginPath()
        ctx.moveTo(X, l1);
        ctx.lineTo(X, Y);
        ctx.lineTo(X + lineWidth, Y);
        ctx.lineTo(X + lineWidth, l1)
        ctx.stroke();


        const { zero, unit } = controls.ruler2;
        //计算量

        if (unit < 20) {
            unit = unit * 10
        }

        const split = getSplit(unit);
        console.log(split, unit);
        const divsion = unit / split;  // 一份刻度线的间距
        const left = zero % unit // 距离零点画多少单位
        const right = -Math.floor(zero / unit)  // 画了几个
        const xpos = left % divsion // x的起始坐标；
        const index = (zero - xpos) / divsion + (lineWidth - zero) / divsion // for循环的次数
        const offset = Math.floor(left / divsion)  // 索引偏移量
        const length = index - offset; // 实际循环次数
        // console.log(length,'-');



        let tip = right
        // let textScale = split > 10 ? split / 10 : 1;
        let sacle = 1
        if (unit < 20) {
            sacle = 10;
        }
        // console.table({offset});

        // 刻度线
        for (let i = - offset, j = 0, g = 0; i < length; i++, j++) {
            const x = X + xpos + j * divsion;
            ctx.beginPath();
            ctx.moveTo(x, X);

            if (i % (split * sacle) === 0) {
                ctx.lineTo(x, l1);
                const text = tip + g * sacle; // 标量文字为当前刻度值
                const textWidth = ctx.measureText(text).width; // 计算标量文字的宽度
                ctx.fillText(text, x - textWidth / 2, l11); // 绘制标量文字
                g++;
            } else {
                if (i % 5 === 0) {
                    ctx.lineTo(x, l2);
                } else {
                    ctx.lineTo(x, l3);
                }
            }
            ctx.stroke();
        }

        function getSplit(unit) {
            let split = 100;
            if (unit <= 500) {
                split = 100;
            }
            if (unit <= 200) {
                split = 50;
            }
            if (unit <= 100) {
                split = 20;
            }
            if (unit <= 50) {
                split = 10;
            }
            if (unit <= 20) {
                split = 1
            }
            return split
        }



        return canvas

    }

    let rulerInstance2 = createRuler3(1000, 500);
    dom3.append(rulerInstance2);

    function update2() {
        dom3.removeChild(rulerInstance2)
        rulerInstance2 = createRuler3(1000, 500);
        dom3.append(rulerInstance2);
    }

    function createRuler3(width, height) {
        const canvas = document.createElement('canvas');
        canvas.style.display = 'block'
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d");


        // 常量
        const X = 50; // 尺子的起点位置
        const Y = 50; // 尺子的起点位置
        const lineWidth = 900; //长度
        const lineHeight = 400 // 高度
        const [tenHeight, fiveHeeight, oneHeight] = [20, 15, 10];
        // 基线

        const X10 = Y - tenHeight;
        const textHeightX = X10 - 10;
        const X5 = Y - fiveHeeight;
        const X1 = Y - oneHeight;

        const Y10 = X - tenHeight;
        const textHeightY = Y10 - 10;
        const Y5 = X - fiveHeeight;
        const Y1 = X - oneHeight;

        ctx.beginPath()
        ctx.moveTo(X, X10);
        ctx.lineTo(X, Y);
        ctx.lineTo(X + lineWidth, Y);
        ctx.lineTo(X + lineWidth, X10);
        ctx.moveTo(Y10, Y);
        ctx.lineTo(X, Y);
        ctx.lineTo(X, Y + lineHeight);
        ctx.lineTo(Y10, Y + lineHeight);
        ctx.stroke();

        const { zeroX, unit, zeroY } = controls.ruler3;
        //计算量

        let scale = 1;
        let UNIT = unit;
        function getScale() {
            if (unit <= 1000) {
                scale = 100;
            }
            if (unit <= 200) {
                scale = 50;
            }
            if (unit <= 100) {
                scale = 20;
            }
            if (unit <= 50) {
                scale = 10;
            }
            if (unit <= 20) {
                scale = 1
            }
        }
        getScale();
        const split = scale;
        const divsion = UNIT / split;

        const left = zeroX % UNIT;
        const right = -Math.floor(zeroX / UNIT)
        const xpos = left % divsion;
        const indexX = (lineWidth - xpos) / divsion;
        const offsetX = Math.floor(left / divsion);
        const lengthX = indexX - offsetX;

        const top = zeroY % UNIT;
        const bottom = -Math.floor(zeroY / UNIT)
        const ypos = top % divsion;
        const indexY = (lineHeight - ypos) / divsion;
        const offsetY = Math.floor(top / divsion);
        const lengthY = indexY - offsetY;


        let num = 0
        ctx.beginPath();
        for (let i = -offsetX, j = 0, g = 0; i < lengthX; i++, j++,g++) {
            const x = X + xpos + j * divsion;
            ctx.moveTo(x, X);

            if (i % split === 0) {
                num = right + Math.floor( i / split)
                ctx.lineTo(x, X10);
                const textWidth = ctx.measureText(num).width; // 计算标量文字的宽度
                ctx.fillText(num, x - textWidth / 2, textHeightX);
            } else {
                if (i % (split / 2) === 0) {
                    ctx.lineTo(x, X5);
                } else {
                    ctx.lineTo(x, X1);
                }
            }
        }
        ctx.stroke();

        ctx.beginPath();
        for (let i = -offsetY, j = 0, g = 0; i < lengthY; i++, j++) {
            const y = Y + ypos + j * divsion;
            ctx.moveTo(Y, y);
            if (i % scale === 0) {
                num = bottom + Math.floor( i / split);
                ctx.lineTo(Y10, y);
                const textWidth = ctx.measureText(num).width; // 计算标量文字的宽度
                ctx.fillText(num, textHeightY -5, y - textWidth /2 + 10);
            } else {
                if (i % (scale / 2) === 0) {
                    ctx.lineTo(Y5, y);
                } else {
                    ctx.lineTo(Y1, y);
                }
            }
        }
        ctx.stroke();

        canvas.style.background = '#fefefe'

        return canvas

    }
}



window.onload = function () {
    init()
}