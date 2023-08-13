<!--
 * @Date: 2023-08-14 01:54:04
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-14 01:54:59
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/index.vue
-->
<template>
  <header>888</header>
  <main class="main">
    <aside class="aside">22</aside>
    <div class="layout">
      <glayout ref="glayoutRoot" class=""    style="width: 100%; height: 100%"></glayout>
    </div>
  </main>
  <footer>444</footer>
</template>

<script lang="ts">
import {layoutConfig} from '../config/layout'
import glayout from '../component/Glout/glayout.vue'
import { defineComponent,ref,onMounted } from 'vue';
export default defineComponent({
    name: 'Layout',
    components: {
        glayout
    },
    setup(props, {expose}) {
    const glayoutRoot = ref(null);

    onMounted(()=>{
      if( glayoutRoot.value){
        (glayoutRoot.value as any).loadGLLayout(layoutConfig)
      }
    })

    expose({
      glayoutRoot:glayoutRoot.value
    })

    return {
      glayoutRoot
    }
    
  }

})
</script>

<style>
@import "golden-layout/dist/css/goldenlayout-base.css"; 
@import "golden-layout/dist/css/themes/goldenlayout-dark-theme.css";
.main{
  display: flex;
  flex-direction: row;
  height: calc(100% - 60px);
}
.aside{
  width: 30px;
}

.layout{
  flex-grow: 1;
}
footer{
  height: 30px;
  width: 100%;
}
</style>