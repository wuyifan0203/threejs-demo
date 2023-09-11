<!--
 * @Date: 2023-08-23 09:39:47
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-11 19:21:31
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/mainView/index.vue
-->
<template>
  <div class="wrapper">
    <div class="tab"> this is Main Vue</div>
    <main id="CAD">
      <div id="main-view"></div>
      <div id="deputy-view"></div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { store } from "@/store";
export default defineComponent({
  name: 'MainView',
  components: {},
  props: [],
  setup() {
    onMounted(() => {
      store.cad.setupCAD();
    })
    return {

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