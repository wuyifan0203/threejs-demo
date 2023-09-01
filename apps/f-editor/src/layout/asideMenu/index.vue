<!--
 * @Date: 2023-08-16 10:14:41
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-01 13:07:07
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/asideMenu/index.vue
-->
<template>
<div class="aside">
    <aside>this is aside</aside>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    name: 'AsideMenu' ,
    components: {},
    props:[],
    setup() {
      return {

      }
    }
})
</script>
<style scoped lang="scss">
@import '../../assets/scss/mixin.scss';
.aside{
  @include background_color("baseBgdColor");
}
</style>