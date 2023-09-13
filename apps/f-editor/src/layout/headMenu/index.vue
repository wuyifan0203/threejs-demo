<!--
 * @Date: 2023-08-15 00:44:56
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-14 00:47:52
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/headMenu/index.vue
-->
<template>
    <div class="menubar">
        <n-space>
            <n-dropdown v-for="item in config" :key="item.key" trigger="hover" :options="item.children"
                @select="handleSelect" size="small" :render-icon="renderIcon"
                >
                {{ item.label }}
            </n-dropdown>
            <n-button type="primary" @click="click" class="btn">change theme</n-button>
        </n-space>
    </div>
</template>

<script lang="ts">
import { defineComponent, h } from "vue";
import { NDropdown, NButton, useMessage, NSpace } from 'naive-ui'
import { config } from "@/config/menu";
import { store } from "@/store";
export default defineComponent({
    name: "Menu",
    components: {
        NDropdown,
        NButton,
        NSpace
    },
    setup() {
        // const menuConfig = ref(config);
        const message = useMessage()
        const click = () => {
            store.app.theme === 'dark' ? store.app.changeTheme('light') : store.app.changeTheme('dark')
        }


        const renderIcon = ()=>{
            return h('i',{class:['f-iconfont','f-xuanzegongju']})
        }
        return {
            click,
            config,
            handleSelect(key: string | number) {
                message.info(String(key))
            },
            renderIcon
        };
    },
});

</script>

<style lang="scss" scope>
@import '../../assets/scss/mixin.scss';

.menubar {
    height: 100%;
    line-height: 25px;
    padding-left:20px; 
    @include background_color("baseBgdColor");

    .btn {
        height: 15px;
    }

    .headMenu {
        margin: 15px;
    }
}
</style>
