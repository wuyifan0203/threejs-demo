<!--
 * @Date: 2023-08-16 10:14:41
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-14 17:42:48
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/asideMenu/index.vue
-->
<template>
  <div class="aside">
    <aside>this is aside
      <n-space vertical>
        <n-button v-for="items in config" :key="items.key" size="small">
          <template #icon>
            <i :class="items.icon" class="aside-icon f-iconfont"></i>
          </template>
        </n-button>
      </n-space>
    </aside>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NSpace, NButton } from 'naive-ui';
import { config } from '@/config/aside'
export default defineComponent({
  name: 'AsideMenu',
  components: {
    NSpace,
    NButton
  },
  props: [],
  setup() {
    return {
      config
    }
  }
})
</script>
<style scoped lang="scss">
@import '../../assets/scss/mixin.scss';

.aside {
  @include background_color("baseBgdColor");

  :deep(.n-button) {
    width: 100%;
    height: 20px;
    padding: 0 5px;
  }
 
  .aside-icon{
    font-size: 20px;
    text-align: center;
    line-height: 20px;
    display: inline;
    @include font_color("fontColor");
  }
}
</style>