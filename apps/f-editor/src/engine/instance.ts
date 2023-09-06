/*
 * @Date: 2023-08-21 00:22:00
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-06 13:52:34
 * @FilePath: /threejs-demo/apps/f-editor/src/engine/instance.ts
 */

import { CAD } from "./CAD";
class Instance {
    private static instance: CAD
    static getInstance() {
        if (!Instance.instance) {
            const mainDOM = document.querySelector('#main-view');
            const deputyDOM = document.querySelector('#depuly-view');
            if (mainDOM && deputyDOM) {
                Instance.instance = new CAD(mainDOM as HTMLElement, deputyDOM as HTMLElement);
            }
        }
        return Instance.instance;
    }
}

export { Instance }