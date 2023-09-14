<!--
 * @Date: 2023-08-14 01:54:04
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-14 20:25:51
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/index.vue
-->
<template>
  <header class="header">
    <HeadMenu>222</HeadMenu>
  </header>
  <main class="main">
    <SideMenu class="aside"></SideMenu>
    <div class="layout">
      <GLayout ref="GLayoutRoot" class="GLayout"></GLayout>
    </div>
  </main>
  <footer class="footer">
    <State></State>
  </footer>

</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { layoutConfig, componentMap } from '../config/layout';
import HeadMenu from './headMenu/index.vue';
import GLayout from '@/components/GLayout/index.vue';
import State from './state/index.vue';
import SideMenu from './asideMenu/index.vue';
export default defineComponent({
  name: 'Layout',
  components: {
    GLayout,
    HeadMenu,
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

.header{
  height: 25px;
}
.main {
  display: flex;
  flex-direction: row;
  height: calc(100% - 45px);
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

.footer {
  height: 20px;
  width: 100%;
}

</style>