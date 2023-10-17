/*
 * @Date: 2023-10-17 20:10:18
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-17 20:38:24
 * @FilePath: /threejs-demo/apps/f-editor/src/engine/Form.ts
 */

import { reactive, watch } from 'vue'
import { generateFormConfig } from "@/modules/form/generateConfig";
import type { TreeNode } from "./Node";
import type { FormConfigType, MeshType } from '@/types'


class Form {
    public config: FormConfigType;
    public attributes: any;

    constructor(typeName: MeshType, node: TreeNode) {
        this.config = generateFormConfig(typeName);

        this.attributes = reactive(node.getAttribute());
    }

}

export { Form }