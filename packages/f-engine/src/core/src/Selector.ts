/*
 * @Date: 2023-06-25 10:27:31
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-14 00:04:52
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
          this.select(selectIds);
      } else {
        this.detach();
      }
    });
  }

  select(selectIds:string[]) {
    selectSet.clear();
    selectIds.forEach(id=>selectSet.add(id));
    const editorSelectionSet = this.editor.getState('selections');
    
    if (isSameSet(editorSelectionSet, selectSet)) return;

    editorSelectionSet.clear();
    editorSelectionSet.add(...selectSet);

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
