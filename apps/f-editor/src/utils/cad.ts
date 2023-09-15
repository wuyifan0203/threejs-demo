/*
 * @Date: 2023-09-14 20:54:54
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-15 17:30:41
 * @FilePath: /threejs-demo/apps/f-editor/src/utils/cad.ts
 */
import { GridHelper, OrthographicCamera } from "three";

function createOrthographicCamera() {
    const s = 15;
    const h = window.innerHeight;
    const w = window.innerWidth;
    return new OrthographicCamera(-s, s, s * (h / w), -s * (h / w), 1, 10000);
}


function createGridHelper() {
    return new GridHelper(50,50,0x00ff00,0x0000ff)
}

export { createOrthographicCamera ,createGridHelper};