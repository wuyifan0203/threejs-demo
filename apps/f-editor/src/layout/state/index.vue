<!--
 * @Date: 2023-08-16 10:20:41
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-28 10:04:12
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/state/index.vue
-->
<template>
<div class="bottom-bar">this is bottom bar</div>
</template>

<script>
import { defineComponent } from 'vue';
export default defineComponent({
    name: 'StateBar' ,
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
.bottom-bar{
  @include background_color("baseBgdColor");
  height: 100%;
}
</style>