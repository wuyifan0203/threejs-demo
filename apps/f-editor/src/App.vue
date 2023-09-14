<!--
 * @Date: 2023-06-09 11:26:39
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-14 20:44:29
 * @FilePath: /threejs-demo/apps/f-editor/src/App.vue
-->
<template>
  <NThemeEditor class="editor">
    <n-config-provider :theme-overrides="themeConfig">
      <n-message-provider>
        <Layout />
      </n-message-provider>
    </n-config-provider>
  </NThemeEditor>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import { NMessageProvider, NConfigProvider, NThemeEditor } from 'naive-ui';
import Layout from "./layout/index.vue";
import { dark, light } from './config/theme'
import { store } from '@/store'
import { emitter } from '@/utils'
export default defineComponent({
  name: 'App',
  components: {
    Layout,
    NMessageProvider,
    NThemeEditor,
    NConfigProvider
  },
  setup() {
    const themeConfig = ref(dark);

    onMounted(() => {
      store.app.changeTheme('dark');
      store.tree.resetTree();
    })


    emitter.on('changeTheme', (theme: string) => {      
      if (theme === 'dark') {
        themeConfig.value = dark;
      } else {
        themeConfig.value = light;
      }
    })
    return {
      themeConfig,
    }
  }
})
</script>

<style lang="scss" >
@import "./assets/scss/global.scss";
@import "golden-layout/dist/css/goldenlayout-base.css";
@import "./assets/scss/mixin.scss";
@import "./assets/scss/overWriteGLayout.scss";
@import 'https://at.alicdn.com/t/c/font_4242393_09qprqmd8arh.css';


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
  font-size: 12px;
  height: 100vh;
  width: 100vw;
  @include font_color("fontColor");
  @include background_color("baseBgdColor");
  @include border_color("border_color1");
}

.f-iconfont{
  font-size: 12px;
}

</style>
