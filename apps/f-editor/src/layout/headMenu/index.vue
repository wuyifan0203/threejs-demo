<!--
 * @Date: 2023-08-16 09:23:16
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-23 10:07:33
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/headMenu/index.vue
-->
<!--
 * @Date: 2023-08-15 00:44:56
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-16 09:37:21
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/menubar/index.vue
-->
<template>
    <div class="menubar">
        <n-dropdown
        v-for="item in config"
        :key="item.key"
        trigger="hover" 
        :options="item.children" 
        @select="handleSelect" 
        size="small">
           {{item.label}}
        </n-dropdown>
        <n-button type="primary" @click="click"></n-button>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { NDropdown, NButton, useMessage } from 'naive-ui'
import { config } from "@/config/menu";
export default defineComponent({
    name: "Menu",
    components: {
        NDropdown,
        NButton
    },
    setup() {
        // const menuConfig = ref(config);
        const message = useMessage()
        const click = () =>{
            const theme =window.document.documentElement.getAttribute("data-theme")
            window.document.documentElement.setAttribute("data-theme", theme === 'dark' ? 'light' : 'dark');
        }
        return {
            click,
            config,
            handleSelect(key: string | number) {
                message.info(String(key))
            }
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
