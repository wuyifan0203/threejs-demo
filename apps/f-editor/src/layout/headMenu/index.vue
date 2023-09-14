<!--
 * @Date: 2023-08-15 00:44:56
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-14 20:26:46
 * @FilePath: /threejs-demo/apps/f-editor/src/layout/headMenu/index.vue
-->
<template>
    <div class="menubar">
        <n-space>
            <Menu :config="config" trigger="click" @select="handleSelect"></Menu>
            <n-button type="primary" @click="click" class="btn">change theme</n-button>
        </n-space>
    </div>
</template>

<script lang="ts">
import { defineComponent} from "vue";
import { NButton, useMessage, NSpace } from 'naive-ui'
import { config } from "@/config/menu";
import { store } from "@/store";
import Menu from "@/components/Menu/index.vue";
export default defineComponent({
    name: "HeadMenu",
    components: {
        NButton,
        NSpace,
        Menu
    },
    setup() {
        const message = useMessage()
        const click = () => {
            store.app.theme === 'dark' ? store.app.changeTheme('light') : store.app.changeTheme('dark')
        }

        return {
            click,
            config,
            handleSelect(key: string | number) {
                message.info(String(key))
            },
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
