<!--
 * @Date: 2023-10-10 20:04:26
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-15 22:10:41
 * @FilePath: /threejs-demo/apps/f-editor/src/components/Form/form.vue
-->

<script lang="tsx">
import { defineComponent } from 'vue';
import {
    NButton,
    NInputNumber,
    NCheckbox,
    NForm,
    NFormItemGi,
    NGrid,
    NSelect,
    NColorPicker,
    NInput,
    NCollapse,
    NCollapseItem,
    NGridItem
} from 'naive-ui';
import { FormItemEnum } from '@/types/form';


export default defineComponent({
    name: 'Form',
    props: {
        config: {
            type: Object,
            default: () => { }
        }
    },
    setup(props) {

        const renderButton = (columnConfig) => (<NButton>{columnConfig.label}</NButton>)
        const renderSelect = (columnConfig) => (<NSelect size='tiny' options={columnConfig.options}></NSelect>)
        const renderCheckbox = (columnConfig) => (<NCheckbox value={columnConfig.key}></NCheckbox>)
        const renderFloatInput = (columnConfig) => (
            <NInputNumber
                size='tiny'
                max={columnConfig.max}
                min={columnConfig.min}
                precision={columnConfig.precision}
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

        const renderFormElement = (columnConfig) => {
            return ElementMap[columnConfig.type](columnConfig);
        }

        const renderColumn = (columnConfig) => {
            console.log(columnConfig);

            
            return (
                <>
                    <NGridItem span={10} class='labelAlign'>
                        {columnConfig.label}
                    </NGridItem>
                    <NGridItem span={14}>{renderFormElement(columnConfig)}</NGridItem>
                </>)
        };

        const renderRow = (rowConfig) => {
            return (<NGrid xGap={props.config.xGap} yGap={props.config.xGap}>
                {rowConfig.columns.map((columnConfig) => renderColumn(columnConfig))}
            </NGrid>)
        }

        const rendrCollapse = (collapseConfig) => {
            return (<NCollapseItem title={collapseConfig.title} class='n-collapse-custom-border'>
                {collapseConfig.rows.map((rowConfig) => renderRow(rowConfig))}
            </NCollapseItem>)
        };

        const renderMain = () => {
            return [(<NCollapse> {
                props.config.groups.map((groups) => rendrCollapse(groups))
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

    .n-collapse-item{
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
    .labelAlign{
        text-align: right;
        padding: 0 5px;
    }
}
</style>