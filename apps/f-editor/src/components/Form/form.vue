<!--
 * @Date: 2023-10-10 20:04:26
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-10 20:55:07
 * @FilePath: /threejs-demo/apps/f-editor/src/components/Form/form.vue
-->

<script lang="tsx">
import { defineComponent } from 'vue';
import { NButton, NInputNumber, NCheckbox, NForm, NFormItem } from 'naive-ui'

export default defineComponent({
    name: 'Form',
    props: {
        config: {
            type: Object,
            default: () => { }
        }
    },
    setup() {

        const renderButton = () => (<NButton>666</NButton>)

        

        return () => (
            <NForm >
                {renderButton()}
            </NForm>
        );
    }
})
</script>