/*
 * @Date: 2023-10-10 20:35:40
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-10 20:53:12
 * @FilePath: /threejs-demo/apps/f-editor/src/config/form.ts
 */

enum FormItemType {
    BUTTON = 'button',
    FlOAT_INPUT = 'floatInput',
    INT_INPUT = 'intInput',
    STRING_INPUT = 'stringInput',
    TEXTAREA = 'textarea',
    CHECKBOX = 'checkbox',
    SLIDER = 'slider',
    RADIO = 'radio',
    SELECT = 'select',
}

const formTestConfig = {
    xGap:12, // col横向间隔
    yGap:8, // row 的纵向间隔
    rows:[
        {
            span:24, // 一行的栅格数
            columns:[
                {
                    type:FormItemType.BUTTON,
                    label:'按钮',
                    span:12
                },
                {
                    type:FormItemType.CHECKBOX,
                    label:'复选框',
                    span:12
                }

            ]
        },
        {
            span:24, // 一行的栅格数
            columns:[
                {
                    type:FormItemType.CHECKBOX,
                    label:'复选框2',
                    span:12
                }
            ]
        }
    ]
}

export {
    formTestConfig
}