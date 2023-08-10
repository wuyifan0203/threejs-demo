/*
 * @Date: 2023-06-29 14:57:42
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-07 01:11:21
 * @FilePath: /threejs-demo/packages/f-engine/src/core/src/Stats.ts
 */

import { UIText, UISpan, UIBreak } from '@/utils/ui';
import { Editor } from './Editor';
import { Mesh, Points } from 'three'

const _objLabel = 'objects';
const _vecLabel = 'vertices';
const _triLabel = 'triangles';
const _famLabel = 'frameTime';

const _style = {
  bottom: '10px',
  left: '10px',
  position: 'absolute',
};

class Stats {
  public domElement: HTMLElement
  private dom: UISpan
  constructor(editor: Editor) {
    const dom = this.dom = new UISpan();
    const objectCol = new UIText();
    const verticesCol = new UIText();
    const trianglesCol = new UIText();
    const frameTimeCol = new UIText();

    dom.add(objectCol);
    dom.add(new UIBreak());
    dom.add(verticesCol);
    dom.add(new UIBreak());
    dom.add(trianglesCol);
    dom.add(new UIBreak());
    dom.add(frameTimeCol);

    dom.setStyle(_style);
    dom.setId('Stats');

    objectCol.setTextContent(`${_objLabel}0`);
    verticesCol.setTextContent(`${_vecLabel}0`);
    trianglesCol.setTextContent(`${_triLabel}0`);
    frameTimeCol.setTextContent(`${_famLabel}0 ms`);

    this.domElement = dom.domElement;

    editor.signals.sceneRendered.add((frameTime: number) => {
      frameTimeCol.setTextContent(`${_famLabel + frameTime.toFixed(2)} ms`);
    });

    editor.signals.objectsAdded.add(update);
    editor.signals.objectsRemoved.add(update);

    function update() {
      const { scene } = editor;

      let objects = 0;
      let vertices = 0;
      let triangles = 0;

      for (let i = 0, l = scene.children.length; i < l; i++) {
        const object = scene.children[i];

        object.traverseVisible((child) => {
          objects++;


          const isMesh = child instanceof Mesh;
          const isPoints = child instanceof Points;
          if ( isMesh || isPoints) {
            const { geometry } = child;
            vertices += geometry.attributes.position.count;

            if (isMesh) {
              if (geometry.index !== null) {
                triangles += geometry.index.count / 3;
              } else {
                triangles += geometry.attributes.position.count / 3;
              }
            }
          }
        });
      }

      objectCol.setTextContent(_objLabel + objects);
      verticesCol.setTextContent(_vecLabel + vertices);
      trianglesCol.setTextContent(_triLabel + triangles);
    }
  }

  show() {
    this.dom.show();
  }

  hide() {
    this.dom.hide();
  }
}

export { Stats };
