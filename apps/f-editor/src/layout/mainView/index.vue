<!--
 * @Date: 2023-08-23 09:39:47
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-08 20:54:05
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/mainView/index.vue
-->
<template>
  <div class="wrapper">
    <div class="tab">
      <Menu :config="config" trigger="click" @select="menuSelect"></Menu>
    </div>
    <main id="CAD">
      <div id="main-view"></div>
      <div id="deputy-view"></div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useMessage } from 'naive-ui'
import { store } from "@/store";
import { config } from '@/config/mainView';
import Menu from '@/components/Menu/index.vue';
import { menuClickEvent } from '@/modules/mainMenu'
export default defineComponent({
  name: 'MainView',
  components: {
    Menu
  },
  props: [],
  setup() {
    onMounted(() => {
      store.cad.setupCAD();
      store.tree.resetTree();
    })
    const message = useMessage()
    return {
      config,
      menuSelect: (key: string, option) => {
        message.info(String(key))
        if (menuClickEvent[key]) {
          menuClickEvent[key](option)
        }

        console.log(key, option);

      }
    }
  }
})
</script>
<style scoped lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;

  .tab {
    height: 25px;
  }

  #CAD {
    flex-grow: 1;
    background-color: aqua;

    #main-view {
      height: 100%;
      width: 100%;
      position: relative;
      background-color: greenyellow;
    }
  }

}
</style>