/*
 * @Date: 2023-10-10 20:35:40
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-13 18:01:14
 * @FilePath: /threejs-demo/apps/f-editor/src/config/form.ts
 */

import { FormItemEnum, type FormGroupType,type FormType, FormRowType } from '@/types/form'
import { cloneDeep } from 'lodash-es';

const formBlockPosition: Array<FormRowType> = [
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


const formTestConfig: FormType = {
    type:'collapse',
    groups:[
        {
            xGap:8,
            yGap:12,
            title:'Position',
            rows:formBlockPosition

        }
    ]
}

export {
    formTestConfig,
}