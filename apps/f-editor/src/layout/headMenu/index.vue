<!--
 * @Date: 2023-08-16 09:23:16
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-28 10:15:40
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
        <n-button type="primary" @click="click" class="btn">change theme</n-button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { NDropdown, NButton, useMessage } from 'naive-ui'
import { config } from "@/config/menu";
import { store } from "@/store";
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
            store.app.theme === 'dark' ? store.app.changeTheme('light') : store.app.changeTheme('dark')
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
@import '../../assets/scss/mixin.scss';
.menubar {
    height: 100%;
    @include background_color("baseBgdColor");
   .btn{
    height: 15px;
   }
}
</style>
