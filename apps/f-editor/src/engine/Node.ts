/*
 * @Date: 2023-09-06 13:53:17
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-06 16:19:13
 * @FilePath: /threejs-demo/apps/f-editor/src/engine/Node.ts
 */
import { TreeNode } from '@f/utils'

class Node extends TreeNode {
  private _visible: boolean;
  public key: string;
  public label: string;
  constructor(type: string, attrs: any = {}) {
    super(type,attrs);
    this._visible = true;
    this.key = this.id;
    this.label = ''
  }

  set visible(value: boolean) {
    this._visible = value;
  }
  get visible() {
    return this._visible;
  }
}

export { Node } 