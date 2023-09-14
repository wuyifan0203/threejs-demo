<!--
 * @Date: 2023-09-14 00:23:24
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-14 20:32:25
 * @FilePath: /threejs-demo/apps/f-editor/src/components/Menu/index.vue
-->
<template>
    <div class="f-menu">
        <n-space>
            <n-dropdown v-for="item in config" :key="item.key" :trigger="trigger" :options="item.children"
                @select="handleSelect" size="small" :render-icon="renderIcon">
                <div>{{ item.label }}</div>
            </n-dropdown>
        </n-space>
    </div>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue';
import { NDropdown, NSpace, MenuOption } from 'naive-ui';
import type { PopoverTrigger } from 'naive-ui';
import { MenuItem } from '@/types/config';

export default defineComponent({
    name: 'Menu',
    components: {
        NDropdown,
        NSpace
    },
    props: {
        config: {
            type: Array as () => Array<MenuOption>,
            default(): Array<MenuOption> {
                return [];
            }
        },
        trigger: {
            type: String as () => PopoverTrigger,
            default: 'click'
        }
    },
    emits: ['select'],
    setup(_, { emit }) {
        const renderIcon = (option) => {
            return h('i', {
                class: [option?.iconfont ?? '', 'f-iconfont']
            });
        };
        const handleSelect = (key: string, option) => {
            emit('select', key, option as MenuItem);
        }


        return {
            renderIcon,
            handleSelect
        }
    }
})
</script>

<style lang="scss">
@import '../../assets/scss/mixin.scss';

.f-menu {
    height: 100%;
    line-height: 25px;
    padding-left: 20px;
    @include background_color("baseBgdColor");


}
</style>