/*
 * @Date: 2023-09-14 19:39:30
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-17 20:14:12
 * @FilePath: /threejs-demo/apps/f-editor/src/types/menu.ts
 */


type MenuOption = {
    label: string;
    key: string;
    disabled?: boolean;
    iconfont?: string;
    children?: Array<MenuItem>;
}

type MenuItem = MenuOption & {
    hotkey?: string;
    children?: Array<MenuItem>;
}

export type { MenuItem, MenuOption };