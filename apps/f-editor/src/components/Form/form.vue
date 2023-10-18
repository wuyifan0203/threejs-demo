<!--
 * @Date: 2023-10-10 20:04:26
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-18 20:57:33
 * @FilePath: /threejs-demo/apps/f-editor/src/components/Form/form.vue
-->

<script lang="tsx">
import { defineComponent } from 'vue';
import {
    NButton,
    NInputNumber,
    NCheckbox,
    NGrid,
    NSelect,
    NColorPicker,
    NInput,
    NCollapse,
    NCollapseItem,
    NGridItem
} from 'naive-ui';
import { FormItemEnum, FormCollapseType, FormRowType, FormItemType } from '@/types/form';
import { DynamicForm } from '@/engine/Form';


export default defineComponent({
    name: 'Form',
    props: {
        instance: {
            type: DynamicForm,
            default: () => { }
        }
    },
    setup(props) {

        const { instance } = props;

        const changeEvent = (val, config) => {
            console.log(val, config, 'changeEvent');

            instance.changeAttributes(val, config)
        }

        const renderButton = (columnConfig) => (<NButton>{columnConfig.label}</NButton>)
        const renderSelect = (columnConfig) => (<NSelect size='tiny' options={columnConfig.options}></NSelect>)
        const renderCheckbox = (columnConfig) => (<NCheckbox value={columnConfig.key}></NCheckbox>)
        const renderFloatInput = (columnConfig) => (
            <NInputNumber
                size='tiny'
                max={columnConfig.max}
                min={columnConfig.min}
                precision={columnConfig.precision}
                onChange={(value) => changeEvent(value, columnConfig)}
                step={0.001}
            />);
        const renderIntInput = (columnConfig) => (
            <NInputNumber
                size='tiny'
                max={columnConfig.max}
                min={columnConfig.min}
                step={1}
            />)

        const renderColorPicker = (columnConfig) => (
            <NColorPicker
                size='small'
                showAlpha={false}
                defaultValue={columnConfig.defaultValue}
            />)

        const renderStringInput = (columnConfig) => (
            <NInput
                maxlength={columnConfig.maxlength}
                minlength={columnConfig.minlength}
                size='tiny'
            />

        )

        const ElementMap = {
            [FormItemEnum.BUTTON]: renderButton,
            [FormItemEnum.SELECT]: renderSelect,
            [FormItemEnum.CHECKBOX]: renderCheckbox,
            [FormItemEnum.FlOAT_INPUT]: renderFloatInput,
            [FormItemEnum.INT_INPUT]: renderIntInput,
            [FormItemEnum.COLOR_PICKER]: renderColorPicker,
            [FormItemEnum.STRING_INPUT]: renderStringInput,
        }

        const renderFormElement = (columnConfig: FormItemType) => {
            return ElementMap[columnConfig.type](columnConfig);
        }

        const renderColumn = (columnConfig: FormItemType) => {
            return (
                <>
                    <NGridItem span={10} class='labelAlign'>
                        {columnConfig.label}
                    </NGridItem>
                    <NGridItem span={14}>{renderFormElement(columnConfig)}</NGridItem>
                </>)
        };

        const renderRow = (rowConfig: FormRowType, collapseConfig: FormCollapseType) => {
            return (<NGrid xGap={collapseConfig.xGap} yGap={collapseConfig.xGap}>
                {rowConfig.columns.map((columnConfig) => renderColumn(columnConfig))}
            </NGrid>)
        }

        const renderCollapse = (collapseConfig: FormCollapseType) => {
            return (<NCollapseItem title={collapseConfig.title} class='n-collapse-custom-border'>
                {collapseConfig.rows.map((rowConfig) => renderRow(rowConfig, collapseConfig))}
            </NCollapseItem>)
        };

        const renderMain = () => {
            return [(<NCollapse> {
                instance.config.groups.map((groups) => renderCollapse(groups))
            }</NCollapse>)]

        }

        return () => (
            <div
                class='f-form'
            >
                {...renderMain()}

            </div>
        );
    }
})
</script>

<style lang="scss">
@import '../../assets/scss/mixin.scss';

.f-form {
    font-size: 12px;

    .n-collapse-item {
        @include font_color("fontColor");
    }

    .n-collapse .n-collapse-item:not(:first-child) {
        border-top: 1px solid #ffffff;
    }

    .n-collapse .n-collapse-item .n-collapse-item__content-wrapper .n-collapse-item__content-inner {
        padding-top: 5px;
    }

    .n-collapse .n-collapse-custom-border {
        border: 1px solid #ffffff;
        margin: 1px 0;
        border-radius: 5px;
        padding: 0 8px;
    }

    .n-collapse .n-collapse-item .n-collapse-item__header {
        padding: 0;
    }

    .labelAlign {
        text-align: right;
        padding: 0 5px;
    }
}
</style>