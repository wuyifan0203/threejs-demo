<!--
 * @Date: 2023-08-15 00:44:56
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-15 01:52:12
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/menubar/index.vue
-->
<template>
    <div class="menubar">
        <Menu v-model:selectedKeys="current" mode="horizontal" :items="menoConfig" size="small" />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { Menu } from 'ant-design-vue'
import { config } from "../../config/menu";
export default defineComponent({
    name: "Menubar",
    components: {
        Menu
    },
    setup() {
        const menoConfig = ref(config);
        const current = ref([menoConfig.value[0].key]);
        return {
            menoConfig,
            current
        };
    },
});

</script>

<style lang="scss" scope>
.menubar {
    .ant-menu-horizontal {
        font-size: 12px;
        line-height: 27px;
    }

    .ant-menu-horizontal>.ant-menu-item-selected::after {
        content: none;
    }
    .ant-menu-horizontal>.ant-menu-item-active::after {
        content: none;
    }

    .ant-menu-horizontal>.ant-menu-item {
        padding-inline: 6px;
    }
}
</style>
