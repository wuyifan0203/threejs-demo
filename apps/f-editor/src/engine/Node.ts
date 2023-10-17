/*
 * @Date: 2023-09-06 13:53:17
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-10-17 20:48:44
 * @FilePath: /threejs-demo/apps/f-editor/src/engine/Node.ts
 */
import { TreeNode } from '@f/utils'

class Node extends TreeNode {
  private _visible: boolean;
  constructor(type: string, attrs: any = {}) {
    super(type,attrs);
    this._visible = false;
  }

  set visible(value: boolean) {
    this._visible = value;
  }
  
  get visible() {
    return this._visible;
  }
}

export { Node as TreeNode } 