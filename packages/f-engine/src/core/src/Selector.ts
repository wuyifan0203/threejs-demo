/*
 * @Date: 2023-06-25 10:27:31
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-11 09:53:18
 * @FilePath: /threejs-demo/packages/f-engine/src/core/src/Selector.ts
 */

import { isSameSet } from '../../utils/common';
import { Editor } from './Editor';

const selectSet = new Set();

class Selector {
  private editor:Editor
  constructor(editor:Editor) {
    this.editor = editor;

    this.editor.signals.intersectionsDetected.add((selectIds:string[]) => {
      if (selectIds.length > 0) {
          this.select([selectIds[0]]);
      } else {
        this.detach();
      }
    });
  }

  select(selectIds:string[]) {
    selectSet.clear();
    selectIds.forEach(id=>selectSet.add(id))
    if (isSameSet(this.editor.getState('selections'), selectSet)) return;

    this.editor.setState('selection',selectIds);

    this.editor.signals.objectsSelected.dispatch(selectIds);
    this.editor.dispatchEvent('selectionChange', selectIds);
  }

  detach() {
    this.editor.setState('selection',[])
    this.editor.signals.objectsSelected.dispatch([]);
    this.editor.dispatchEvent('selectionChange', []);
  }
}

export { Selector };
