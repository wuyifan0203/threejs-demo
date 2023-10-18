<!--
 * @Date: 2023-08-16 10:37:44
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-18 20:53:46
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/editor/index.vue
-->
<template>
  <div ref="formRef">
    <div class="form">
      <NScrollbar :style="{
        maxHeight:formHeight
      }">
        <Form :instance="instance"></Form>
      </NScrollbar>
    </div>
  </div>
</template>

<script lang="ts">
import { Ref, computed, defineComponent, ref } from 'vue';
import Form from '@/components/Form/form.vue';
import {NScrollbar} from 'naive-ui'
import { DynamicForm } from '@/engine/Form';
import { emitter } from '@/utils'
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

    const instance:Ref<null|DynamicForm> = ref(null);

    emitter.on('createMeshNode',(ins:DynamicForm)=>{
      instance.value = ins
    })
    return {
      instance,
      formHeight
    }
  }
})
</script>
<style scoped>

</style>