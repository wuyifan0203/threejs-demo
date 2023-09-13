<!--
 * @Date: 2023-09-14 00:23:24
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-14 02:06:33
 * @FilePath: /threejs-demo/apps/f-editor/src/components/Menu/indec.vue
-->
<template>
 <n-space>
    <n-dropdown  
    v-for="item in config" 
    :key="item.key" 
    :options="item.children" 
    :trigger="trigger"
    @select="handleSelect" size="small" :render-icon="renderIcon"
    >
        <div>{{ item.label }}</div>
    </n-dropdown>
 </n-space>
</template>

<script lang="ts">
import { defineComponent,h } from 'vue';
import {NDropdown,MenuOption, NSpace} from 'naive-ui';

export default defineComponent({
    name:'Menu',
    components:{
        NDropdown,
        NSpace
    },
    props:{
        config:{
            type:Array<MenuOption>,
            default:()=>[]
        },
        trigger:{
            type:String,
            default:'click'
        }
    },
    setup(props, context) {
        const renderIcon = (option) => {
            return h('i', {
                class: [option?.icon ?? '','f-iconfont']
            });
        };
        const handleSelect = (key:string,option:MenuOption) => {
            context.emit('select',key,option)
        }
        return {
            renderIcon,
            handleSelect
        }
    }
})
</script>

<style>
</style>