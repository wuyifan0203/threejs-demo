<!--
 * @Date: 2023-08-16 10:14:41
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-09 20:09:28
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/asideMenu/index.vue
-->
<template>
  <div class="aside">
    <aside>this is aside
      <n-space vertical>
        <div v-for="items in config" :key="items.key" class="button" @click="asideClick(items)">
          <i :class="items.icon" class="aside-icon f-iconfont"></i>
        </div>
      </n-space>
    </aside>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NSpace, NButton } from 'naive-ui';
import { config } from '@/config/aside'
import { menuClickEvent } from '@/modules/asideMenu'
export default defineComponent({
  name: 'AsideMenu',
  components: {
    NSpace,
    NButton
  },
  props: [],
  setup() {
    const asideClick = (item) => {
      console.log(item);
      if(item.key in menuClickEvent){
        menuClickEvent[item.key]()
      }
    }
    return {
      config,
      asideClick
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

  .aside-icon {
    font-size: 16px;
    text-align: center;
    line-height: 20px;
    display: inline;
    @include font_color("fontColor");
  }

  .button {
    width: 25px;
    height: 25px;
    line-height: 30px;
    text-align: center;
    border: 1px solid #ccc;
    box-shadow: 0 0 1px 0 #ccc;
    border-radius: 5px;
  }
}
</style>