<!--
 * @Date: 2023-08-16 10:37:44
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-15 17:42:04
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/editor/index.vue
-->
<template>
  <div ref="formRef">this is edit bar
    <div class="form">
      <NScrollbar :style="{
        maxHeight:formHeight
      }">
        <Form :config="formTestConfig"></Form>
      </NScrollbar>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import Form from '@/components/Form/form.vue';
import {NScrollbar} from 'naive-ui'
import { formTestConfig } from '@/config/form'
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
      return (formRef.value?.clientHeight ?? 330) + 'px'
    })
    return {
      formTestConfig,
      formHeight
    }
  }
})
</script>
<style scoped>

</style>