/*
 * @Date: 2023-11-09 15:38:59
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-11-09 18:02:52
 * @FilePath: /threejs-demo/examples/src/helper/Ruler.js
 */

import {
    Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, CanvasTexture, Vector2, Vector3
} from '../lib/three/three.module.js';

const DirectionX = {
    '1': 1,
    '2': -1,
    '3': 1,
    '-1': -1,
    '-2': 1,
    '-3': -1,
};

const DirectionY = {
    '1': 1,
    '2': 1,
    '3': 1,
    '-1': 1,
    '-2': 1,
    '-3': 1,
};

class Ruler {
    constructor(camera, renderer) {
        this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.camera.zoom = 2;
        this.camera.updateProjectionMatrix();

        this.canvas = document.createElement('canvas');
        this.canvas.width = renderer.domElement.clientWidth;
        this.canvas.height = renderer.domElement.clientHeight;

        this.object = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: new CanvasTexture(this.canvas) }));
        this.span = 40;
        this._ctx = this.canvas.getContext('2d');

        this.background = '#ffffff';
        this.color = '#858585';
        this.halvingLine = '#858585';
        this.heightLight = '#e0eff5';
        this.renderer = renderer;
        this.size = new Vector2(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
        this.target = camera;

        this.normal = 1;
        this.zero = new Vector2(1, 1);
        this.unit = new Vector2(1, 1);
        this.division = 10;
        this.mark = new Vector3(12, 8, 5);

        this.gridUnit = new Vector2(1, 1);
    }

    render() {
        if (!this.object.visible) return;
        this.size.set(this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight);
        this.update();
        this.object.material.map.needsUpdate = true;

        this.renderer.setScissorTest(true);
        this.renderer.setScissor(0, 0, this.size.x, this.size.y);
        this.renderer.setViewport(0, 0, this.size.x, this.size.y);
        this.renderer.render(this.object, this.camera);
        this.renderer.clearDepth();
        this.renderer.setScissorTest(false);
    }

    update() {
        this.clear();
        this.drawBaseLine();
        this.getZeroUnit();
        // this.drawHightLightRange();
        this.drawMark();
    }

    clear() {
        this._ctx.clearRect(0, 0, this.size.x, this.size.y);
        this._ctx.beginPath();
        this._ctx.fillStyle = this.background;
        this._ctx.fillRect(0, 0, this.size.x, this.size.y);
        this._ctx.stroke();
    }

    drawBaseLine() {
        this._ctx.beginPath();
        this._ctx.moveTo(0, this.span);
        this._ctx.lineTo(this.span, this.span);
        this._ctx.lineTo(this.span, this.size.y);
        this._ctx.lineTo(0, this.size.y);
        this._ctx.moveTo(this.span, 0);
        this._ctx.lineTo(this.span, this.span);
        this._ctx.lineTo(this.size.x, this.span);
        this._ctx.lineTo(this.size.x, 0);
        this._ctx.stroke();
    }

    getZeroUnit() {
        const PMIX = this.target.projectionMatrixInverse.elements[0];
        const PMIY = this.target.projectionMatrixInverse.elements[5];

        const [width, height] = [this.size.x - this.span, this.size.y - this.span];
        const { x, y, z } = this.target.position;
        // 获取单位
        if (this.normal === 1) {
            // z normal xy
            this.zero.x = (width - (x * width) / PMIX) / 2 + this.span;
            this.zero.y = (height + (y * height) / PMIY) / 2 + this.span;
            this.unit.x = ((width / PMIX)) / 2;
            this.unit.y = ((height / PMIY)) / 2;
        } else if (this.normal === 2) {
            // y normal xz
            this.zero.x = (width + (x * width) / PMIX) / 2 + this.span;
            this.zero.y = (height + (z * height) / PMIY) / 2 + this.span;
            this.unit.x = ((width / PMIX)) / 2;
            this.unit.y = ((height / PMIY)) / 2;
        } else if (this.normal === 3) {
            // x normal yz
            this.zero.x = (width - (y * width) / PMIX) / 2 + this.span;
            this.zero.y = (height + (z * height) / PMIY) / 2 + this.span;
            this.unit.x = ((width / PMIX)) / 2;
            this.unit.y = ((height / PMIY)) / 2;
        } else if (this.normal === -1) {
            // neg z normal xy
            this.zero.x = (width + (x * width) / PMIX) / 2 + this.span;
            this.zero.y = (height + (y * height) / PMIY) / 2 + this.span;
            this.unit.x = ((width / PMIX)) / 2;
            this.unit.y = ((height / PMIY)) / 2;
        } else if (this.normal === -2) {
            // y normal xz
            this.zero.x = (width - (x * width) / PMIX) / 2 + this.span;
            this.zero.y = (height + (z * height) / PMIY) / 2 + this.span;
            this.unit.x = ((width / PMIX)) / 2;
            this.unit.y = ((height / PMIY)) / 2;
        } else if (this.normal === -3) {
            // x normal yz
            this.zero.x = (width + (y * width) / PMIX) / 2 + this.span;
            this.zero.y = (height + (z * height) / PMIY) / 2 + this.span;
            this.unit.x = ((width / PMIX)) / 2;
            this.unit.y = ((height / PMIY)) / 2;
        }

    }

    drawMark() {
        const { unit } = this.updateScaleRatio();


        const { _ctx, zero, mark } = this;

        // x轴刻度间隔
        const divX = unit.x / this.division;
        // x轴起始位置
        const posX = zero.x % divX;
        // 左边剩余大格子数
        const left = Math.floor(zero.x / unit.x);
        // 第一个大刻度之前的小刻度个数
        let right = Math.floor((zero.x % unit.x) / divX);
        // 这行代码非常的奇妙删掉就去世，我猜以后维护的人会很疑惑，实际就是 math.floor
        right = right < 0 ? right + 1 : right;

        const directionX = DirectionX[this.normal];

        // 大格子个数
        const indexX = Math.ceil((this.size.x - posX) / divX + right);
        // 绘制刻度
        _ctx.beginPath();


        _ctx.fillStyle = this.halvingLine;
        _ctx.strokeStyle = this.color;

        let text = '';
        let textWidth = 0;
        for (let i = indexX - left * this.division - right, j = 0, k = -left; j < indexX; i++, j++) {
            const x = posX + j * divX;
            _ctx.moveTo(x, this.span);

            const currentIndex = j - right;

            if (currentIndex % 5 === 0) {
                if (currentIndex % 10 === 0) {
                    // 大刻度
                    _ctx.textBaseline = 'alphabetic';
                    _ctx.textAlign = 'start';

                    text = String(directionX * k * this.gridUnit.x);
                    textWidth = _ctx.measureText(text).width;
                    _ctx.fillText(text, x - textWidth / 2, this.span - mark.x - 5);

                    _ctx.lineTo(x, this.span - mark.x);
                    k++;
                } else {
                    // 小刻度
                    _ctx.lineTo(x, this.span - mark.y);
                }
            } else {
                // 分割线
                _ctx.lineTo(x, this.span - mark.z);
            }
        }
        _ctx.stroke();
        _ctx.closePath();

        // y轴刻度间隔
        const divY = unit.y / this.division;
        // y轴起始位置
        const posY = zero.y % divY;
        // 上边剩余大格子数
        const top = Math.floor(zero.y / unit.y);
        // 第一个大刻度之前的小刻度个数
        let bottom = Math.floor((zero.y % unit.y) / divY);
        bottom = bottom < 0 ? bottom + 1 : bottom;
        // 大格子个数
        const indexY = Math.ceil((this.size.y - posY) / divY + bottom);
        // 绘制刻度
        _ctx.beginPath();

        const directionY = DirectionY[this.normal];

        for (let i = indexY - top * this.division - bottom, j = 0, k = top; j < indexY; i++, j++) {
            const y = posY + j * divY;
            _ctx.moveTo(this.span, y);

            const currentIndex = j - bottom;

            if (currentIndex % 5 === 0) {
                if (currentIndex % 10 === 0) {
                    // 大刻度
                    text = String(directionY * k * this.gridUnit.y);
                    textWidth = _ctx.measureText(text).width;
                    _ctx.textBaseline = 'top';
                    _ctx.textAlign = 'end';
                    _ctx.fillText(text, this.span - mark.x - 5, y - textWidth / 2);
                    _ctx.lineTo(this.span - mark.x, y);
                    k--;
                } else {
                    // 小刻度
                    _ctx.lineTo(this.span - mark.y, y);
                }
            } else {
                // 分割线
                _ctx.lineTo(this.span - mark.z, y);
            }
        }
        _ctx.stroke();
        _ctx.closePath();
        _ctx.beginPath();
        _ctx.fillStyle = this.background;
        _ctx.fillRect(0, 0, this.span, this.span);
        _ctx.stroke();
    }

    updateScaleRatio() {
        const { x, y } = this.unit;
        const xResult = this.getScaleRatio(x);
        const yResult = this.getScaleRatio(y);

        const unit = new Vector2().set(xResult.gridUnit * x, yResult.gridUnit * y);

        this.gridUnit.set(xResult.gridUnit, yResult.gridUnit);

        return { unit, xResult, yResult};
    }

    getScaleRatio(interval) {
        let i = 0,
            j = 0;

        while (interval < 10) {
            i++;
            interval = interval * 10;
        }

        while (interval >= 100) {
            j--;
            interval = interval / 10;
        }

        let ratio = 1;
        if (interval < 25) {
            ratio = 5;
        } else if (interval < 50) {
            ratio = 2;
        } else {
            ratio = 1;
        }

        const division = Math.pow(10, i + j);

        let gridUnit = 5;
        if (ratio === 1) {
            gridUnit = division;
        } else if (ratio === 2) {
            gridUnit = 2 * division;
        } else if (ratio === 5) {
            gridUnit = 4 * division;
        }

        return {
            ratio,
            division,
            gridUnit,
        };
    }

}

export { Ruler }