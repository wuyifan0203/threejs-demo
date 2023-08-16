<!--
 * @Date: 2023-06-08 17:53:51
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-16 10:18:26
  * @FilePath: /threejs-demo/apps/f-editor/src/layout/asideMenu/index.vue
-->
<template>
  <div ref="GLComponent" style="position: absolute; overflow: hidden">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
export default defineComponent({
  name: "",
  components: {},
  props: [],
  setup(props,{expose}) {
    const GLComponent = ref(null);

    const numberToPixels = (value:Number) => {
      return value.toString(10) + "px";
    };

    const setPosAndSize = (left:Number, top:Number, width:Number, height:Number) => {
      if (GLComponent.value) {
        const el:HTMLElement = GLComponent.value;
        el.style.left = numberToPixels(left);
        el.style.top = numberToPixels(top);
        el.style.width = numberToPixels(width);
        el.style.height = numberToPixels(height);
      }
    };

    const setVisibility = (visible:Boolean) => {
      if (GLComponent.value) {
        const el :HTMLElement= GLComponent.value;
        if (visible) {
          el.style.display = "";
        } else {
          el.style.display = "none";
        }
      }
    };

    const setZIndex = (value:string) => {
      if (GLComponent.value) {
        const el:HTMLElement = GLComponent.value;
        el.style.zIndex = value;
      }
    };

    expose({
      setPosAndSize,
      setVisibility,
      setZIndex,
    });
    return {
      GLComponent
    };
  },
});
</script>
