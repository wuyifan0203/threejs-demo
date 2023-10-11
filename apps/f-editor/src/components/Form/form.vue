<!--
 * @Date: 2023-10-10 20:04:26
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-11 20:45:35
 * @FilePath: /threejs-demo/apps/f-editor/src/components/Form/form.vue
-->

<script lang="tsx">
import { defineComponent } from 'vue';
import { NButton, NInputNumber, NCheckbox, NForm, NFormItemGi, NGrid, NSelect, NColorPicker, NInput } from 'naive-ui';
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
            return (
                <NFormItemGi
                    span={columnConfig.span}
                    showFeedback={false}
                    label={columnConfig.type === FormItemEnum.BUTTON ? '' : columnConfig.label}>
                    {renderFormElement(columnConfig)}
                </NFormItemGi>)
        };

        const renderRow = (rowConfig) => {
            return (
                <NGrid xGap={props.config.xGap} yGap={props.config.xGap}>
                    {rowConfig.columns.map((columnConfig) => renderColumn(columnConfig))}
                </NGrid>)
        }

        const renderMain = () => {
            return props.config.rows.map((rowConfig) => renderRow(rowConfig))
        }

        return () => (
            <NForm
                size='small'
                labelPlacement='left'
            >
                {...renderMain()}
            </NForm>
        );
    }
})
</script>