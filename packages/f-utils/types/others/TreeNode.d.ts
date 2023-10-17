/*
 * @Date: 2023-09-06 15:34:29
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-17 20:22:28
 * @FilePath: /threejs-demo/packages/f-utils/types/others/TreeNode.d.ts
 */
import { EventDispatcher } from './EventDispatcher';
declare class TreeNode extends EventDispatcher {
    readonly id: string;
    children: TreeNode[];
    parent: null | TreeNode;
    private attribute;
    name: string;
    private _type;
    constructor(type: string, attribute?: {
        [key: string | symbol]: any;
    });
    get type(): string;
    add(node: TreeNode): void;
    getAttribute(): any;
    setAttribute(attribute: {
        [key: string | symbol]: any;
    }): void;
    remove(node: TreeNode): this;
    removeFromParent(): this;
    clear(): void;
    getNotesByProperty(key: keyof TreeNode, value: any): TreeNode[];
    getNodeByProperty(key: keyof TreeNode, value: any): TreeNode | undefined;
}
export { TreeNode };
