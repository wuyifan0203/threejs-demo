/*
 * @Date: 2023-09-06 13:53:17
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-06 16:33:11
 * @FilePath: /threejs-demo/packages/f-utils/src/others/TreeNode.ts
 */
import { MathUtils } from 'three';
import { deepClone } from './common';
import { EventDispatcher } from './EventDispatcher'
const { generateUUID } = MathUtils;

const removedEvent = 'removed';
const addedEvent = 'added';
const changeEvent = 'change';

class TreeNode extends EventDispatcher {
    readonly id: string;
    public name: string;
    public children: TreeNode[];
    public parent: null | TreeNode;
    private attribute: { [key: string | symbol]: any };
    private _type: string

    constructor(type: string, attribute: { [key: string | symbol]: any } = {}) {
        super();
        this.name = '';
        this.id = generateUUID();
        this.children = [];
        this.parent = null;
        this.attribute = attribute;
        this._type = type;
    }

    get type() {
        return this._type;
    }

    // 增
    add(node: TreeNode) {
        if(node === this){
            return console.warn('node can not be added to itself');
        }
        node.parent = this;
        this.children.push(node);
        node.dispatchEvent(addedEvent, node);
    }

    // 改
    getAttribute() {
        return deepClone(this.attribute);
    }

    setAttribute(attribute: { [key: string | symbol]: any }) {
        this.dispatchEvent(changeEvent, deepClone(this.attribute), attribute)
        Object.assign(this.attribute, attribute);
    }

    // 删
    remove(node: TreeNode) {
        const index = this.children.indexOf(node);
        if (index !== -1) {
            this.children.splice(index, 1);
            node.parent = null;
            node.dispatchEvent(removedEvent, node);

        }
        return this
    }

    removeFromParent() {
        if (this.parent) {
            this.parent.remove(this);
        }
        return this;
    }

    clear() {
        this.children.forEach((n) => {
            this.remove(n)
        });
    }

    // 查
    getNotesByProperty(key: keyof TreeNode, value: any): TreeNode[] {
        let result: TreeNode[] = [];

        if (this[key] === value) result.push(this);

        for (let i = 0, l = this.children.length; i < l; i++) {
            const childResult = this.children[i].getNotesByProperty(key, value);

            if (childResult.length > 0) {
                result = result.concat(childResult);
            }
        }

        return result;
    }

    getNodeByProperty(key: keyof TreeNode, value: any): TreeNode | undefined {
        if (this[key] === value) return this;

        for (let i = 0, l = this.children.length; i < l; i++) {
            const child = this.children[i];

            const object = child.getNodeByProperty(key, value);
            if (object !== undefined) {
                return object;
            }
        }

        return undefined;
    }
}

export { TreeNode } 