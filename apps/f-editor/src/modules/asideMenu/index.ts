/*
 * @Date: 2023-10-09 20:11:06
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-09 20:17:18
 * @FilePath: /threejs-demo/apps/f-editor/src/modules/asideMenu/index.ts
 */
import { store } from '@/store';

const menuClickEvent = {
    select() {
        store.cad.setOptionMode('select');
    },
    move(){
        store.cad.setOptionMode('translate');
    },
    rotate(){
        store.cad.setOptionMode('rotate');
    },
    scale(){
        store.cad.setOptionMode('scale');
    }
}

export { menuClickEvent }