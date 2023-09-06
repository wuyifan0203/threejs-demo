<!--
 * @Date: 2023-08-16 21:31:59
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-06 20:57:29
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/objectTree/index.vue
-->
<template>
  <div>this is Object Tree
    <n-input v-model:value="pattern" placeholder="搜索" />
  </div>
  <n-tree block-line :data="treeData" key-field="id" label-field="name" :selectable="false"  :render-prefix="renderPrefix"/>
</template>

<script lang="ts">
import { computed, defineComponent,h,ref } from 'vue';
import { NTree,TreeSelectRenderPrefix ,NInput} from 'naive-ui';
import { store } from '@/store'
export default defineComponent({
  name: 'ObjectTree',
  components: {
    NTree,
    NInput
  },
  props: [],
  setup() {
    const treeData = computed(()=>[store.tree.currentTree]);
    const pattern = ref('');

    const renderPrefix:TreeSelectRenderPrefix = ({option,checked,selected})=>{
      console.log(option,checked,selected);
      
      return  h(
          'i',
          { text: true, type: 'primary' },
          { default: () => 'Suffix' }
        )
    }
    return {
      treeData,
      pattern,
      renderPrefix
    }
  }
})
</script>
<style scoped>
.n-tree {
  --n-arrow-color: #000;
}
</style>