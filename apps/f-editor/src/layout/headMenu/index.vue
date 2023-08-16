<!--
 * @Date: 2023-08-16 09:23:16
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-16 10:45:56
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
        return {
            // options: [
            //     {
            //         label: '滨海湾金沙，新加坡',
            //         key: 'marina bay sands',
            //         disabled: true
            //     },
            //     {
            //         label: '布朗酒店，伦敦',
            //         key: "brown's hotel, london"
            //     },
            //     {
            //         label: '亚特兰蒂斯巴哈马，拿骚',
            //         key: 'atlantis nahamas, nassau'
            //     },
            //     {
            //         label: '比佛利山庄酒店，洛杉矶',
            //         key: 'the beverly hills hotel, los angeles'
            //     }
            // ],
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
