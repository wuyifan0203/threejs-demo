<!--
 * @Date: 2023-08-16 21:31:59
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-11 20:59:05
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/objectTree/index.vue
-->
<template>
  <div>this is Object Tree
    <n-input v-model:value="pattern" placeholder="搜索" />
  </div>
  <n-tree block-line :data="treeData" key-field="id" label-field="name" :selectable="false" :render-prefix="renderPrefix"
    :render-suffix="renderSuffix" />
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, h, ref } from 'vue';
import { NTree, TreeSelectRenderPrefix, NInput, TreeSelectRenderSuffix } from 'naive-ui';
import  Icon from '@/components/Icon/index.vue'
import { store } from '@/store'
export default defineComponent({
  name: 'ObjectTree',
  components: {
    NTree,
    NInput,
  },
  props: [],
  setup() {
    const treeData = computed(() => [store.tree.currentTree]);
    const pattern = ref('');

    const scoped = getCurrentInstance();
    console.log(scoped);

    const Icon = scoped!.appContext.components.Icon

    const renderPrefix: TreeSelectRenderPrefix = ({ option, checked, selected }) => {
      console.log(option, checked, selected);

      return h(
        Icon,
        { 
          // class: ['f-iconfont','f-_collection'] 
          props:{
            iconName:'f-_collection'
          }
        },
      )
    }

    const renderSuffix: TreeSelectRenderSuffix = ({ option, checked, selected }) => {
      return h(
        'i',
        { class: '' },
        { default: () => 'Suffix' }
      )
    }
    return {
      treeData,
      pattern,
      renderPrefix,
      renderSuffix
    }
  }
})
</script>
<style scoped>
.n-tree {
  --n-arrow-color: #000;
}
</style>