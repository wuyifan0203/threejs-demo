import { FormItemEnum, type FormRowType } from "@/types/form";
import { defaultForm } from "./default";

const cubeForm: Array<FormRowType> = [
    ...defaultForm,
    {
        span: 24, // 一行的栅格数
        columns: [
            {
                type: FormItemEnum.FlOAT_INPUT,
                label: 'Width',
                key: 'width',
                span: 24
            }
        ]
    },
    {
        span: 24, // 一行的栅格数
        columns: [
            {
                type: FormItemEnum.FlOAT_INPUT,
                label: 'Height',
                key: 'height',
                span: 24
            }
        ]
    },
    {
        span: 24, // 一行的栅格数
        columns: [
            {
                type: FormItemEnum.FlOAT_INPUT,
                label: 'Depth',
                key: 'depth',
                span: 24
            }
        ]
    },
    {
        span: 24, // 一行的栅格数
        columns: [
            {
                type: FormItemEnum.FlOAT_INPUT,
                label: 'Width Segments',
                key: 'widthSegments',
                span: 24,
            }
        ]
    },
    {
        span: 24, // 一行的栅格数
        columns: [
            {
                type: FormItemEnum.FlOAT_INPUT,
                label: 'Height Segments',
                key: 'heightSegments',
                span: 24
            }
        ]
    },
    {
        span: 24, // 一行的栅格数
        columns: [
            {
                type: FormItemEnum.FlOAT_INPUT,
                label: 'Depth Segments',
                key: 'depthSegments',
                span: 24
            }
        ]
    },
]


export { cubeForm };