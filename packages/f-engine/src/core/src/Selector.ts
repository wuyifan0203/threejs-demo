/*
 * @Date: 2023-06-25 10:27:31
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-03 01:03:15
 * @FilePath: /threejs-demo/packages/f-engine/src/core/src/Selector.ts
 */

import { isSameArray } from '../../utils/common';
import { Editor } from './Editor';

class Selector {
  private editor:Editor
  constructor(editor:Editor) {
    // 是否为多选模式
    this.editor = editor;

    this.editor.signals.intersectionsDetected.add((selectIds) => {
      if (selectIds.length > 0) {
          this.select([selectIds[0]]);
      } else {
        this.detach();
      }
    });
  }

  select(selectIds) {
    if (isSameArray(this.editor.getState('selections'), selectIds)) return;

    this.editor.setState('selection',selectIds);

    this.editor.signals.objectSelected.dispatch(selectIds);
    this.editor.dispatchEvent('selectionChange', selectIds);
  }

  detach() {
    this.editor.setState('selection',[])
    this.editor.signals.objectSelected.dispatch([]);
    this.editor.dispatchEvent('selectionChange', []);
  }
}

export { Selector };
