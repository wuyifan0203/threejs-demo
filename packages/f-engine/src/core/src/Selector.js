/*
 * @Date: 2023-06-25 10:27:31
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-04 14:57:44
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Selector.js
 */

import { isSameArray } from '../../utils/common';

class Selector {
  constructor(editor) {
    // 是否为多选模式
    this.multipleSelect = false;
    this.editor = editor;
    this.signals = editor.signals;

    this.signals.intersectionsDetected.add((selectIds) => {
      if (selectIds.length > 0) {
        if (!this.multipleSelect) {
          // 多选模式会全部选择
          this.select(selectIds);
        } else {
          // 非多选模式只会选择最近的物体
          this.select([selectIds[0]]);
        }
      } else {
        this.detach([]);
      }
    });
  }

  select(selectIds) {
    if (isSameArray(this.editor.selected, selectIds)) return;

    this.editor.selected = selectIds;

    this.signals.objectSelected.dispatch(selectIds);
    this.editor.dispatchEvent('selectionChange', selectIds);
  }

  detach() {
    this.editor.selected = [];
    this.signals.objectSelected.dispatch([]);
    this.editor.dispatchEvent('selectionChange', []);
  }
}

export { Selector };
