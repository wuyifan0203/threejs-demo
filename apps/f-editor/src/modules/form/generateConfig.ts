/*
 * @Date: 2023-10-16 20:51:07
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-17 20:18:20
 * @FilePath: /threejs-demo/apps/f-editor/src/modules/form/generateConfig.ts
 */
import { FormConfigType, MeshType } from '@/types';
import { transformForm } from './default'
import { cubeForm } from './cube'

const formConfigMap = {
    Cube: cubeForm
}

function generateFormConfig(typeName: MeshType): FormConfigType {
    return {

        type: 'collapse',
        groups: [
            {
                xGap: 8,
                yGap: 12,
                title: 'General',
                name: 'general',
                rows: formConfigMap[typeName]
            },
            {
                xGap: 8,
                yGap: 12,
                title: 'Collection',
                name: 'collection',
                rows: transformForm
            }
        ]

    }
}

export { generateFormConfig }