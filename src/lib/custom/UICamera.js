import { OrthographicCamera, Vector2, Vector3, Matrix4, Vector4 } from "three";

const _halfSize = new Vector2();

/**
 * @class UICamera
 * @extends OrthographicCamera
 *
 * 用于在 three.js 中做 UI 渲染的专用相机。
 * 屏幕坐标系指 DOM 坐标系，以屏幕左上角 (0, 0) 为原点，右下角 (width, height)。
 */
class UICamera extends OrthographicCamera {
    /**
     * 构造函数
     * @param {number} width - 屏幕宽度
     * @param {number} height - 屏幕高度
     */
    constructor(width, height) {
        // 计算一半大小
        _halfSize.set(width, height).multiplyScalar(0.5);

        // 调用 OrthographicCamera 的构造函数
        // left, right, top, bottom, near, far
        super(-_halfSize.x, _halfSize.x, _halfSize.y, -_halfSize.y, 0, 1);

        this._width = width;
        this._height = height;

        // 用于将屏幕坐标[0, width]x[0, height] 转换到世界坐标 [left, right]x[top, bottom] 的矩阵
        // screenMatrix: Screen -> World
        // screenMatrixInverse: World -> Screen (inverse transform)
        this.screenMatrix = new Matrix4();
        this.screenMatrixInverse = new Matrix4();

        // 初始化更新矩阵
        this.updateScreenMatrix();
    }

    /**
     * 当屏幕大小发生改变时，更新相机参数并更新 screenMatrix
     * @param {number} width - 新的屏幕宽度
     * @param {number} height - 新的屏幕高度
     */
    resize(width, height) {
        this._width = width;
        this._height = height;
        _halfSize.set(width, height).multiplyScalar(0.5);

        // 更新正交相机的截面
        this.left = -_halfSize.x;
        this.right = _halfSize.x;
        this.top = _halfSize.y;
        this.bottom = -_halfSize.y;
        this.updateProjectionMatrix();

        // 更新用于屏幕坐标 <-> 世界坐标的矩阵
        this.updateScreenMatrix();
    }

    /**
     * 更新 screenMatrix (屏幕坐标 -> 世界坐标) 和其逆矩阵 (世界坐标 -> 屏幕坐标)
     */
    updateScreenMatrix() {
        // 假设屏幕坐标 (0,0) 在左上角，(width, height) 在右下角。
        // 在 OrthographicCamera 中:
        //    left < right
        //    bottom < top
        //    top = +height/2, bottom = -height/2 (若保持默认)
        //
        // 令:
        //   scaleX = ( right - left ) / width
        //   scaleY = ( bottom - top ) / height   // 注意 top > bottom, 所以 scaleY 通常是负值
        //
        // 那么对于屏幕坐标 (x_screen, y_screen) 有:
        //   x_world = left + scaleX * x_screen
        //   y_world = top  + scaleY * y_screen
        //
        // 这样:
        //   x=0   -> x_world= left
        //   x=width -> x_world= right
        //   y=0   -> y_world= top
        //   y=height -> y_world= bottom (因为 scaleY<0 )
        //
        // screenMatrix 为 4x4 仿射变换矩阵:
        //
        // [ scaleX     0       0    left ]
        // [    0    scaleY     0     top ]
        // [    0       0       1      0  ]
        // [    0       0       0      1  ]

        const scaleX = (this.right - this.left) / this._width;
        const scaleY = (this.bottom - this.top) / this._height;

        this.screenMatrix.set(
            scaleX, 0, 0, this.left,
            0, scaleY, 0, this.top,
            0, 0, 1, 0,
            0, 0, 0, 1
        );

        // 计算逆矩阵，用于世界坐标 -> 屏幕坐标转换
        this.screenMatrixInverse.copy(this.screenMatrix).invert();
    }

    /**
     * 将屏幕坐标 (screenX, screenY) 转换到世界坐标
     * 注意：这里的屏幕坐标是 DOM 坐标，左上角 (0,0)，向右向下增大
     * @param {number} screenX - 屏幕坐标 x
     * @param {number} screenY - 屏幕坐标 y
     * @param {Vector3} [target=new Vector3()] - 输出世界坐标的向量
     * @returns {Vector3} 返回世界坐标 (x_world, y_world, z_world)
     */
    convertScreenPositionToWorld(screenX, screenY, target = new Vector3()) {
        // 我们将 (x, y, 0, 1) 向量直接乘以 screenMatrix
        const vec4 = new Vector4(screenX, screenY, 0, 1);
        vec4.applyMatrix4(this.screenMatrix);
        target.set(vec4.x, vec4.y, vec4.z);
        return target;
    }

    /**
     * 将世界坐标 (worldPos.x, worldPos.y, worldPos.z) 转换到屏幕坐标
     * @param {Vector3} worldPos - 世界坐标
     * @param {Vector3} [target=new Vector3()] - 输出屏幕坐标的向量
     * @returns {Vector3} 返回屏幕坐标 (x_screen, y_screen)
     */
    convertWorldPositionToScreen(worldPos, target = new Vector3()) {
        // 如果 screenMatrix 是 Screen -> World，则其逆矩阵 screenMatrixInverse 即为 World -> Screen
        target.copy(worldPos);
        target.applyMatrix4(this.screenMatrixInverse);
        return target;
    }
}

export { UICamera };
