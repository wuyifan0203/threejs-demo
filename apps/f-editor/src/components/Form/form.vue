<!--
 * @Date: 2023-10-10 20:04:26
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-11 02:19:38
 * @FilePath: /threejs-demo/apps/f-editor/src/components/Form/form.vue
-->

<script lang="tsx">
import { defineComponent } from 'vue';
import { NButton, NInputNumber, NCheckbox, NForm, NFormItemGi,NGrid,NSelect } from 'naive-ui';
import { FormItemEnum } from '@/config/form';


export default defineComponent({
    name: 'Form',
    props: {
        config: {
            type: Object,
            default: () => { }
        }
    },
    setup(props) {

        const renderButton = (columnConfig) => (<NButton></NButton>)
        const renderSelect = (columnConfig) => (<NSelect></NSelect>)
        const renderCheckbox = (columnConfig) => (<NCheckbox></NCheckbox>)

        const ElementMap = {
            button: renderButton,
            select: renderSelect,
            checkbox: renderCheckbox
        }


        const  renderFormElement = (columnConfig) => {
            console.log(columnConfig);
            
            return ElementMap[columnConfig.type](columnConfig);
        }

        

        const renderColumn = (columnConfig) => {
            return (<NFormItemGi span={columnConfig.span} label={columnConfig.label}>
                {renderFormElement(columnConfig)}
            </NFormItemGi>)
        };

        const renderRow = (rowConfig) =>{
            console.log(rowConfig);
            
            return (<NGrid xGap={props.config.xGap} yGap={props.config.xGap}>
                {rowConfig.columns.map((columnConfig) => renderColumn(columnConfig))}
            </NGrid>)
        }


        const renderMain = ()=>{
           return props.config.rows.map((rowConfig) => renderRow(rowConfig))  
        }
        

        return () => (
            <NForm >
                {...renderMain()}
            </NForm>
        );
    }
})
</script>