<!--
 * @Date: 2023-06-09 11:26:39
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-21 01:40:26
 * @FilePath: /threejs-demo/apps/f-editor/src/App.vue
-->
<template>
  <n-message-provider>
    <Layout />
  </n-message-provider>
</template>

<script lang="ts">
import Layout from "./layout/index.vue";
import {NMessageProvider} from 'naive-ui'
import { defineComponent, onMounted } from 'vue';
export default defineComponent({
  name: 'App',
  components: {
    Layout,
    NMessageProvider
  },
  setup() {
    onMounted(()=>{
      window.document.documentElement.setAttribute("data-theme", 'drak');
    })
  }
})
</script>

<style >

@import "./assets/scss/mixin.scss";
@import "golden-layout/dist/css/goldenlayout-base.css";
@import "golden-layout/dist/css/themes/goldenlayout-dark-theme.css";
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
