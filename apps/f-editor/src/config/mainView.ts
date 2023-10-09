/*
 * @Date: 2023-09-14 00:59:22
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-09 20:52:45
 * @FilePath: /threejs-demo/apps/f-editor/src/config/mainView.ts
 */

export const config = [
    {
        label: 'Add',
        key: 'add',
        children: [
            {
                label: 'Mesh',
                key: 'mesh',
                children: [
                    {
                        label: 'Cube',
                        key: 'cube',
                    },
                    {
                        label: 'Sphere',
                        key: 'sphere'
                    },
                    {
                        label: 'Cylinder',
                        key: 'cylinder'
                    },
                ]
            },
            {
                label: 'Plane',
                key: 'plane',
                children: [
                    {
                        label: 'Rectangle',
                        key: 'rectangle',
                    },
                    {
                        label: 'Circle',
                        key: 'circle'
                    },
                ]
            },
            {
                label: 'Line',
                key: 'line',
            },
            {
                label: 'Particle',
                key: 'particle',
            },
            {
                label: 'Surface',
                key: 'surface',
            },
            {
                label: 'Text',
                key: 'text',
            },
            {
                label: 'Group',
                key: 'group',
            },
            {
                type: 'divider',
                key: 'd1'
            },
            {
                label: 'Light',
                key: 'light',
                children: [
                    {
                        label: 'Point',
                        key: 'point',
                    },
                    {
                        label: 'Direction',
                        key: 'direction',
                    },
                ]
            }
        ]
    },
    {
        label: 'Object',
        key: 'object',
        children: [

        ]
    },
]