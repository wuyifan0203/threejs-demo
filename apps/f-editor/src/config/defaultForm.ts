/*
 * @Date: 2023-10-10 20:35:40
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-16 20:38:00
 * @FilePath: /threejs-demo/apps/f-editor/src/config/defaultForm.ts
 */

const transform = {
    locationX: 0,
    locationY: 0,
    locationZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    mode: 'xyz'
};

const visibility = {
    visible: true,
    castShadow: true,
    receiveShadow: true,
    doubleSided: true,
}

export { transform, visibility }