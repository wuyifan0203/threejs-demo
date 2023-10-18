/*
 * @Date: 2023-10-17 20:10:18
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-18 20:43:38
 * @FilePath: /threejs-demo/apps/f-editor/src/engine/Form.ts
 */

import { reactive, watch } from 'vue'
import { generateFormConfig } from "@/modules/form/generateConfig";
import type { TreeNode } from "./Node";
import type { FormConfigType, MeshType } from '@/types'


class DynamicForm {
    public config: FormConfigType;
    public attributes: any;

    constructor(type:MeshType,node: TreeNode) {
        this.config = generateFormConfig(type);

        this.attributes = reactive(node.getAttribute());
    }

    changeAttributes(value,config){
        console.log(value,config);
        
    }

}

export { DynamicForm }