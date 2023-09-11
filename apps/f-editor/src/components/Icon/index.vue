<!--
 * @Date: 2023-09-11 19:56:26
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-11 19:58:28
 * @FilePath: /threejs-demo/apps/f-editor/src/component/Icon/index.vue
-->
<template>
    <svg :class="svgClass" aria-hidden="true">
        <use :xlink:href="iconClassName" />
    </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps({
    iconName: {
        type: String,
        required: true
    },
    className: {
        type: String,
        default: ''
    },
});
// 图标在 iconfont 中的名字
const iconClassName = computed(() => {
    return `#${props.iconName}`;
})
// 给图标添加上类名
const svgClass = computed(() => {
    if (props.className) {
        return `svg-icon ${props.className}`;
    }
    return 'svg-icon';
});
</script>

<style scoped>
.svg-icon {
    width: 1em;
    height: 1em;
    position: relative;
    fill: currentColor;
    vertical-align: -2px;
}
</style>