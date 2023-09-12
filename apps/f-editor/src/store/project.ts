/*
 * @Date: 2023-09-12 14:59:30
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-12 15:03:49
 * @FilePath: /threejs-demo/apps/f-editor/src/store/project.ts
 */


import { defineStore } from "pinia";

const useProjectStore = defineStore({
    id: "Project",
    state: () => ({
        projects: [],
        project:null
    }),
    getters: {
        currentProject: (state) => state.project
    },
    actions: {
        resetProject() {
        },

        createProject() {
        }
    }
})

export { useProjectStore }