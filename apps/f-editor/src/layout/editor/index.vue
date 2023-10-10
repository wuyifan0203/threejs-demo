<!--
 * @Date: 2023-08-16 10:37:44
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-10 20:53:59
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/editor/index.vue
-->
<template>
  <div>this is edit bar
    <div>
      <Form :config="formTestConfig"></Form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Form from '@/components/Form/form.vue';
import { formTestConfig } from '@/config/form'
export default defineComponent({
  name: 'EditBar',
  components: {
    Form
  },
  props: [],
  setup() {
    return {
      formTestConfig
    }
  }
})
</script>
<style scoped></style>