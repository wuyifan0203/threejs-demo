<!--
 * @Date: 2023-06-09 11:26:39
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-15 01:34:41
 * @FilePath: /threejs-demo/apps/f-editor/src/App.vue
-->
<template>
  <Layout />
</template>

<script lang="ts">
import Layout from "./layout/index.vue";
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'App',
  components: {
    Layout
  }
})
</script>

<style >
body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  font-size: 12px!important;
  height: 100vh;
  width: 100vw;
}
</style>
