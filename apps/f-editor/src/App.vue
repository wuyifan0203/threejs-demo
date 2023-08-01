<template>
  <div class="main">
      <glayout ref="glayoutRoot"     style="width: 100%; height: 100%"></glayout>
  </div>
</template>

<script lang="ts">
import {layoutConfig} from './config/layout'
import glayout from './component/Glout/glayout.vue'
import {defineComponent,onMounted,ref} from 'vue';
export default defineComponent({
  name:'App',
  components:{
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
html {
    height: 100%;
}
body {
    height: 100%;
    margin: 0;
    overflow: hidden;
}
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    height: 100%;
    width: 100%;
}
.main{
  height: 100%;
}


</style>
