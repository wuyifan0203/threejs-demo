/*
 * @Date: 2023-10-10 20:35:40
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-11 20:56:03
 * @FilePath: /threejs-demo/apps/f-editor/src/config/form.ts
 */

import { FormItemEnum,type FormType } from '@/types/form'

const formTestConfig :FormType = {
    xGap: 12, // col横向间隔
    yGap: 8, // row 的纵向间隔
    rows: [
        {
            span: 24, // 一行的栅格数
            columns: [
                {
                    type: FormItemEnum.BUTTON,
                    label: '按钮',
                    span: 12
                },
                {
                    type: FormItemEnum.CHECKBOX,
                    label: '复选框',
                    span: 12
                }

            ]
        },
        {
            span: 24, // 一行的栅格数
            columns: [
                {
                    type: FormItemEnum.CHECKBOX,
                    label: '复选框2',
                    span: 24
                }
            ]
        },
        {
            span: 24, // 一行的栅格数
            columns: [
                {
                    type: FormItemEnum.FlOAT_INPUT,
                    label: '小数输入框',
                    span: 24
                }
            ]
        },
        {
            span: 24, // 一行的栅格数
            columns: [
                {
                    type: FormItemEnum.INT_INPUT,
                    label: '整数输入框',
                    span: 24
                }
            ]
        },
        {
            span: 24, // 一行的栅格数
            columns: [
                {
                    type: FormItemEnum.SELECT,
                    label: '选择框',
                    span: 24,
                    options: [
                        {
                            label: 'Drive My Car',
                            value: 'song1'
                        },
                        {
                            label: 'Norwegian Wood',
                            value: 'song2'
                        },
                        {
                            label: "You Won't See",
                            value: 'song3',
                            disabled: true
                        },
                    ]
                }
            ]
        },
        {
            span: 24, // 一行的栅格数
            columns: [
                {
                    type: FormItemEnum.COLOR_PICKER,
                    label: 'colorPicker',
                    span: 24,
                }
            ]
        },
    ]
}

export {
    formTestConfig,
}