import { CAD } from "./CAD";

/*
 * @Date: 2023-08-21 00:22:00
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-21 00:28:24
 * @FilePath: /threejs-demo/apps/f-editor/src/engine/instance.ts
 */
class Instance{
    private static instance:CAD
    static getInstance(){
        if(!Instance.instance){
            const mainDOM = document.querySelector('#main-view');
            const depulyDOM = document.querySelector('#depuly-view');
            if(mainDOM && depulyDOM){
                Instance.instance = new CAD(mainDOM as HTMLElement,depulyDOM as HTMLElement);
            }
        }
        return Instance.instance;
    }
}

export {Instance}