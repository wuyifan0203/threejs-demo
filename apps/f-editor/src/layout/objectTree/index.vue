<!--
 * @Date: 2023-08-16 21:31:59
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-22 00:51:16
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/objectTree/index.vue
-->
<template>
  <div>this is Object Tree</div>
  <n-tree block-line :data="data" :selectable="false" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NTree } from 'naive-ui'
export default defineComponent({
  name: 'ObjectTree',
  components: {
    NTree
  },
  props: [],
  setup() {

    const data = [
      {
        label: 'Scene',
        key: 'id',
        visable: true,
        children: [
          {
            label: 'Camera',
            key: 'q',
          },
          {
            label: 'MEsh',
            key: 'w',
          },
          {
            label: 'Object',
            key: 'e',
          },
          {
            label: 'Circle',
            key: 'r',
          },
          {
            label: 'Camera',
            key: 't',
          },
          {
            label: 'Camera',
            key: 'id1',
          }
        ]
      }
    ]
    return {
      data

    }
  }
})
</script>
<style scoped>
.n-tree{
  --n-arrow-color: #000;
}

</style>