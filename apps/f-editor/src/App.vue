<!--
 * @Date: 2023-06-09 11:26:39
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-24 01:46:06
 * @FilePath: /threejs-demo/apps/f-editor/src/App.vue
-->
<template>
  <NThemeEditor class="editor">
    <n-config-provider  :theme-overrides="dark">
      <n-message-provider>
      <Layout />
    </n-message-provider>
    </n-config-provider>
  </NThemeEditor>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { NMessageProvider,NConfigProvider ,NThemeEditor} from 'naive-ui';
import Layout from "./layout/index.vue";
import {dark} from './config/theme'
import {store} from '@/store'
export default defineComponent({
  name: 'App',
  components: {
    Layout,
    NMessageProvider,
    NThemeEditor,
    NConfigProvider
  },
  setup() {
    onMounted(() => {
      store.appStore.changeTheme('dark');
    })
    return {
      dark,
     }
  }
})
</script>

<style lang="scss" >
@import "./assets/scss/mixin.scss";
@import "golden-layout/dist/css/goldenlayout-base.css";
@import "golden-layout/dist/css/themes/goldenlayout-dark-theme.css";

body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.n-config-provider {
  height: 100vh;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  font-size: 12px !important;
  height: 100vh;
  width: 100vw;
  font-size: 18px;
  @include font_color("font_color1");
  @include background_color("background_color1");
  @include border_color("border_color1");
}
</style>
