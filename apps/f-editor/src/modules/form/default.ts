/*
 * @Date: 2023-10-16 20:28:37
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-16 20:54:56
 * @FilePath: /threejs-demo/apps/f-editor/src/modules/form/default.ts
 */
import { FormItemEnum, type FormRowType } from '@/types/form'

const transformForm: Array<FormRowType> = [
    {
        span: 24, // 一行的栅格数
        columns: [
            {
                type: FormItemEnum.FlOAT_INPUT,
                label: 'Location X',
                key: 'locationX',
                span: 24
            }
        ]
    },
    {
        span: 24, // 一行的栅格数
        columns: [
            {
                type: FormItemEnum.FlOAT_INPUT,
                label: 'Y',
                key: 'locationY',
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
                key: 'locationZ',
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
                key: 'rotationX',
                span: 24,
            }
        ]
    },
    {
        span: 24, // 一行的栅格数
        columns: [
            {
                type: FormItemEnum.FlOAT_INPUT,
                label: 'Y',
                key: 'rotationY',
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
                key: 'rotationZ',
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
                key: 'mode',
                span: 24,
                options: [
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
                label: 'Scale X',
                key: 'scaleX',
                span: 24
            }
        ]
    },
    {
        span: 24, // 一行的栅格数
        columns: [
            {
                type: FormItemEnum.FlOAT_INPUT,
                label: 'Y',
                key: 'scaleY',
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
                key: 'scaleZ',
                span: 24
            }
        ]
    },
]

const defaultForm: Array<FormRowType> = [
    {
        span: 24, // 一行的栅格数
        columns: [
            {
                type: FormItemEnum.STRING_INPUT,
                label: 'Name',
                key: 'name',
                span: 24
            }
        ]
    },
    {
        span: 24, // 一行的栅格数
        columns: [
            {
                type: FormItemEnum.STRING_INPUT,
                label: 'Id',
                key: 'id',
                span: 24,
                disabled: () => true
            }
        ]
    }
]


export {
    defaultForm,
    transformForm
}