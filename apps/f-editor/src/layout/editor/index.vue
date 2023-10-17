<!--
 * @Date: 2023-08-16 10:37:44
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-17 20:03:13
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/editor/index.vue
-->
<template>
  <div ref="formRef">
    <div class="form">
      <NScrollbar :style="{
        maxHeight:formHeight
      }">
        <Form :config="formConfig"></Form>
      </NScrollbar>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import Form from '@/components/Form/form.vue';
import {NScrollbar} from 'naive-ui'
import { generateFormConfig } from '@/modules/form/generateConfig'
export default defineComponent({
  name: 'EditBar',
  components: {
    Form,
    NScrollbar
  },
  props: [],
  setup() {
    const formRef = ref<null|HTMLElement>(null)
    const formHeight = computed(()=>{
      return (formRef.value?.clientHeight ?? 340) + 'px'
    })

    const formConfig = generateFormConfig('Cube')
    return {
      formConfig,
      formHeight
    }
  }
})
</script>
<style scoped>

</style>