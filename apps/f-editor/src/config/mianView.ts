/*
 * @Date: 2023-09-14 00:59:22
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-14 01:55:43
 * @FilePath: /threejs-demo/apps/f-editor/src/config/mianView.ts
 */

export const config = [
    {
        label: 'Home',
        key: 'home',
        children: [
            {
                label: 'Home',
                key: 'home',
            },
            {
                label: 'Home',
                key: 'home1',
            },
            {
                label: 'Home',
                key: 'home2',
            },
            {
                label: 'Home',
                key: 'home3',
                children:[
                    {
                        label: 'Home',
                        key: 'home',
                    },
                    {
                        label: 'Home',
                        key: 'home1',
                    },
                ]
            }
        ]
    },
    {
        label: 'About',
        key: 'about',
    },
    {
        label: 'Contact',
        key: 'contact',
    },
    {
        label: 'Blog',
        key: 'blog',
    }
]