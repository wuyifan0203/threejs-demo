<!--
 * @Date: 2023-08-16 21:31:59
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-17 19:57:55
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/objectTree/index.vue
-->
<template>
  <div class="tree-head">
    <div class="tree-filter">this is Object Tree</div>
    <n-input v-model:value="pattern" placeholder="" class="tree-search" autosize style="min-width: 40%">
      <template #prefix>
        <i class="f-iconfont f-sousuo"></i>
      </template>
    </n-input>
  </div>
  <n-tree block-line :data="treeData" key-field="id" label-field="name" :render-prefix="renderPrefix"
    :render-suffix="renderSuffix" :default-expand-all="true" />
</template>

<script lang="ts">
import { computed, defineComponent, h, ref, onMounted, nextTick } from 'vue';
import { NTree, TreeSelectRenderPrefix, NInput, TreeSelectRenderSuffix } from 'naive-ui';
import { store } from '@/store';
import type { TreeNode } from '@/engine/Node';

const iconMap = {
  Root: 'f-_collection',
  Group: 'f-_collection',
  Camera: 'f-camera',
  Light: 'f-light',
  Modal: 'f-moxing2',
  Mesh: 'f-moxing2'
}

export default defineComponent({
  name: 'ObjectTree',
  components: {
    NTree,
    NInput,
  },
  props: [],
  setup() {
    const treeData = computed(() => [store.tree.sceneTree]);
    const pattern = ref('');

    const renderPrefix: TreeSelectRenderPrefix = ({ option }) => {
      const iconName = iconMap[(option as unknown as TreeNode).type];
      return h('i', { class: [iconName, 'f-iconfont'] })
    }

    const renderSuffix: TreeSelectRenderSuffix = ({ option }) => {
      const iconName = !(option as unknown as TreeNode).visible ? 'f-yanjing_xianshi' : 'f-yanjing_yincang';
      return h('i', { class: [iconName, 'f-iconfont'] ,onclick:visibleClick})
    }

    const visibleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }

    onMounted(() => {
      nextTick(()=>{

      })
  
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
<style scoped lang="scss">
.tree-head {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.tree-filter,
.tree-search {
  height: 20px;
}

.n-tree {
  :deep(.n-tree-node-wrapper) {
    padding: 0;
  }
}
</style>