/*
 * @Date: 2023-08-21 00:15:34
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-24 01:34:12
 * @FilePath: /threejs-demo/apps/f-editor/src/store/modules/app.ts
 */

import { defineStore } from "pinia";

const useAppStore = defineStore({
    id: "app",
    state: () => ({
        theme: "dark",
    }),
    getters: {},
    actions: {
        changeTheme(theme: 'dark'| 'light') {
            window.document.documentElement.setAttribute("data-theme", theme);
            this.theme = theme;
        },
    }
})

export {useAppStore}