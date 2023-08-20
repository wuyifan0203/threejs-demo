<!--
 * @Date: 2023-08-14 01:54:04
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-21 01:35:49
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/index.vue
-->
<template>
  <Menu>222</Menu>
  <main class="main">
    <SideMenu class="aside"></SideMenu>
    <div class="layout">
      <GLayout ref="GLayoutRoot" class="GLayout"></GLayout>
    </div>
  </main>
  <State></State>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { layoutConfig, componentMap } from '../config/layout';
import Menu from './headMenu/index.vue';
import GLayout from '../component/GLayout/index.vue';
import State from './state/index.vue';
import SideMenu from './asideMenu/index.vue';
export default defineComponent({
  name: 'Layout',
  components: {
    GLayout,
    Menu,
    State,
    SideMenu
  },
  setup(props, { expose }) {
    const GLayoutRoot = ref(null);

    onMounted(() => {
      if (GLayoutRoot.value) {
        (GLayoutRoot.value as any).loadGLLayout(layoutConfig, componentMap)
      }
    })

    expose({
      GLayoutRoot: GLayoutRoot.value
    })

    return {
      GLayoutRoot
    }

  }

})
</script>

<style lang="scss">


.main {
  display: flex;
  flex-direction: row;
  height: calc(100% - 60px);
}

.aside {
  width: 30px;
}

.layout {
  flex-grow: 1;
}

.GLayout {
  width: 100%;
  height: 100%;
}

footer {
  height: 30px;
  width: 100%;
}

</style>