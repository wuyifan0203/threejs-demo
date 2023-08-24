/*
 * @Date: 2023-08-21 00:15:34
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-24 19:50:25
 * @FilePath: /threejs-demo/apps/f-editor/src/store/modules/app.ts
 */

import { defineStore } from "pinia";
import { emitter } from "@/utils";

const useAppStore = defineStore({
    id: "app",
    state: () => ({
        theme: "dark",
    }),
    getters: {},
    actions: {
        changeTheme(theme: 'dark'| 'light') {
            this.theme = theme;
            window.document.documentElement.setAttribute("data-theme", theme);
            emitter.emit('changeTheme',theme)
        },
    }
})

export {useAppStore}