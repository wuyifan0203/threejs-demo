<!--
 * @Date: 2023-08-16 21:31:59
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-12 17:51:21
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
import { computed, defineComponent, h, ref, onMounted } from 'vue';
import { NTree, TreeSelectRenderPrefix, NInput, TreeSelectRenderSuffix } from 'naive-ui';
import { store } from '@/store';
import type { Node } from '@/engine/Node';

const iconMap = {
  Root: 'f-_collection',
  Group: 'f-_collection',
  Camera:'f-camera',
  Light:'f-light',
  Modal:'f-moxing2'
}

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

    const renderPrefix: TreeSelectRenderPrefix = ({ option }) => {
      const iconName = iconMap[(option as unknown as Node).type];
      return h('i', { class: [iconName,'f-iconfont']})
    }

    const renderSuffix: TreeSelectRenderSuffix = ({ option }) => {
      const iconName = !(option as unknown as Node).visible ? 'f-yanjing_xianshi' : 'f-yanjing_yincang';
      return h('i', { class: [iconName,'f-iconfont']})
    }

    onMounted(()=>{
      store.tree.resetTree();
    })

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