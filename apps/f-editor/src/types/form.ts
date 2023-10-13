/*
 * @Date: 2023-10-11 20:32:08
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-13 17:53:42
 * @FilePath: /threejs-demo/apps/f-editor/src/types/form.ts
 */


enum FormItemEnum {
    BUTTON = 'button',
    FlOAT_INPUT = 'floatInput',
    INT_INPUT = 'intInput',
    STRING_INPUT = 'stringInput',
    CHECKBOX = 'checkbox',
    SELECT = 'select',
    COLOR_PICKER = 'colorPicker',
}

type FormGroupType = {
    xGap: number, // col横向间隔
    yGap: number, // row 的纵向间隔
    rows: Array<FormRowType>
}

type FormCardType = {
    xGap: number, // col横向间隔
    yGap: number, // row 的纵向间隔
    border: boolean,
    title: string,
    rows: Array<FormRowType>
}

type FormCollapseType = {
    xGap: number, // col横向间隔
    yGap: number, // row 的纵向间隔
    name: string|number,
    title: string,
    explain:string,
    rows: Array<FormRowType>
}

type FormCardsType = {
    type:'card' 
    groups: Array<FormCardType>
}

type FormCollapsesType = {
    type:'collapse' 
    groups: Array<FormCollapseType>
}

type FormType = FormCollapsesType | FormCardsType;

type FormRowType = {
    span: number
    columns: Array<FormItemType>
}

type FormColumnType = {
    span: number
    type: FormItemEnum
    label: string
    disabled?: (...arg) => boolean
}

type FormItemIntInputType = {
    max?: number
    min?: number
} & FormColumnType

type FormItemFloatInputType = {
    max?: number
    min?: number
    precision?: number
} & FormColumnType

type FormItemStringInputType = {
    maxLength?: number
    minLength?: number
} & FormColumnType

type FormItemSelectType = {
    options: Array<{
        value: string
        label: string,
        disabled?: boolean
    }>
} & FormColumnType


type FormItemCheckboxType = FormColumnType

type FormItemColorPickerType = {
    defaultValue?: boolean
} & FormColumnType

type FormItemButtonType = FormColumnType

type FormItemType =
    FormItemButtonType |
    FormItemCheckboxType |
    FormItemColorPickerType |
    FormItemFloatInputType |
    FormItemIntInputType |
    FormItemSelectType |
    FormItemStringInputType

export { FormItemEnum }

export type {
    FormType,
    FormRowType,
    FormColumnType,
    FormItemIntInputType,
    FormItemFloatInputType,
    FormItemStringInputType,
    FormItemSelectType,
    FormItemCheckboxType,
    FormItemColorPickerType,
    FormItemButtonType,
    FormItemType,
    FormGroupType
}