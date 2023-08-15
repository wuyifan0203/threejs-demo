/*
 * @Date: 2023-08-15 01:10:19
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-16 01:36:27
 * @FilePath: /threejs-demo/apps/f-editor/src/config/menu.ts
 */


export const config = [
    {
        key: 'file',
        label: 'File',
        children: [
            {
                key: 'new',
                label: 'New',
            },
            {
                key: 'open',
                label: 'Open',
            },
            {
                key: 'save',
                label: 'Save',
            },
            {
                key: 'saveAs',
                label: 'Save As',
            },
            {   
                key: 'export',
                label: 'Export',
            }
        ]
    },
    {
        key: 'edit',
        label: 'Edit',
        children: [
            {
                key: 'undo',
                label: 'Undo',
            },
            {
                key: 'redo',
                label: 'Redo',
            },
        ]
    },
    {
        key: 'view',
        label: 'View',
        children: [
            {
                key: 'zoomIn',
                label: 'Zoom In',
            },
            {
                key: 'zoomOut',
                label: 'Zoom Out',          
            },
            {
                key: 'resetZoom',
                label: 'Reset Zoom',
            },
            {
                key: 'toggleGrid',
                label: 'Toggle Grid',   
            },
        ]   
    },
    {
        key: 'about',
        label: 'About',
        children: [
            {
                key: 'about',
                label: 'About',
            },
            {
                key: 'contact',
                label: 'Contact',
            },
        ]
    },
]