<!--
 * @Date: 2023-08-16 21:31:59
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-06 16:22:12
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/objectTree/index.vue
-->
<template>
  <div>this is Object Tree</div>
  <n-tree block-line :data="treeData" :selectable="false" />
</template>

<script lang="ts">
import { computed, defineComponent,ref } from 'vue';
import { NTree } from 'naive-ui';
import { store } from '@/store'
export default defineComponent({
  name: 'ObjectTree',
  components: {
    NTree
  },
  props: [],
  setup() {
    const treeData = computed(()=>[store.tree.currentTree])
    return {
      treeData
    }
  }
})
</script>
<style scoped>
.n-tree {
  --n-arrow-color: #000;
}
</style>