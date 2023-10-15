/*
 * @Date: 2023-10-10 20:35:40
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-15 18:32:27
 * @FilePath: /threejs-demo/apps/f-editor/src/config/form.ts
 */

import { FormItemEnum, type FormGroupType,type FormType, FormRowType } from '@/types/form'

const formBlockTransform: Array<FormRowType> = [
        {
            span: 24, // 一行的栅格数
            columns: [
                {
                    type: FormItemEnum.FlOAT_INPUT,
                    label: 'Location X',
                    span: 24
                }
            ]
        },
        {
            span: 24, // 一行的栅格数
            columns: [
                {
                    type: FormItemEnum.FlOAT_INPUT,
                    label:  'Y',
                    span: 24
                }
            ]
        },
        {
            span: 24, // 一行的栅格数
            columns: [
                {
                    type: FormItemEnum.FlOAT_INPUT,
                    label: 'Z',
                    span: 24
                }
            ]
        },
        {
            span: 24, // 一行的栅格数
            columns: [
                {
                    type: FormItemEnum.FlOAT_INPUT,
                    label: 'Rotation X',
                    span: 24,
                }
            ]
        },
        {
            span: 24, // 一行的栅格数
            columns: [
                {
                    type: FormItemEnum.FlOAT_INPUT,
                    label:  'Y',
                    span: 24
                }
            ]
        },
        {
            span: 24, // 一行的栅格数
            columns: [
                {
                    type: FormItemEnum.FlOAT_INPUT,
                    label: 'Z',
                    span: 24
                }
            ]
        },
        {
            span: 24, // 一行的栅格数
            columns: [
                {
                    type: FormItemEnum.SELECT,
                    label: 'Mode',
                    span: 24,
                    options:[
                        {
                            label: 'XYZ',
                            value: 'xyz'
                        },
                        {
                            label: 'YZX',
                            value: 'yzx'
                        },
                        {
                            label: 'ZYX',
                            value: 'zyx'
                        },

                    ]
                }
            ]
        },
        {
            span: 24, // 一行的栅格数
            columns: [
                {
                    type: FormItemEnum.FlOAT_INPUT,
                    label: 'Sclae X',
                    span: 24
                }
            ]
        },
        {
            span: 24, // 一行的栅格数
            columns: [
                {
                    type: FormItemEnum.FlOAT_INPUT,
                    label:  'Y',
                    span: 24
                }
            ]
        },
        {
            span: 24, // 一行的栅格数
            columns: [
                {
                    type: FormItemEnum.FlOAT_INPUT,
                    label: 'Z',
                    span: 24
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
            title:'Transform',
            name:'transform',
            rows:formBlockTransform
        },
        {
            xGap:8,
            yGap:12,
            title:'Collection',
            name:'collection',
            rows:formBlockTransform
        }
    ]
}

export {
    formTestConfig,
}