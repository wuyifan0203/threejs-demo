/*
 * @Date: 2023-06-29 14:57:42
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-29 17:07:55
 * @FilePath: /threejs-demo/packages/app/CAD/src/core/src/Stats.js
 */

import { UIText, UISpan, UIBreak } from "../../utils/ui";

class Stats {
  constructor(editor) {
    this.enable = true;

    const dom = new UISpan();
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

    dom.setStyle({
      bottom: "10px",
      left: "10px",
      position: "absolute",
    });
    dom.setId("Stats");

    const [objLabel, vecLabel, triLabel, famLabel] = [
      "objects : ",
      "vertices : ",
      "triangles : ",
      "frameTime : ",
    ];

    objectCol.setTextContent(objLabel + "0");
    verticesCol.setTextContent(vecLabel + "0");
    trianglesCol.setTextContent(triLabel + "0");
    frameTimeCol.setTextContent(famLabel + "0 ms");

    this.domElement = dom.domElement;

    this.update = function () {
      const scene = editor.scene;

      let objects = 0,
        vertices = 0,
        triangles = 0;

      for (let i = 0, l = scene.children.length; i < l; i++) {
        const object = scene.children[i];

        object.traverseVisible((child) => {
          objects++;

          if (child?.isMesh || child?.isPoints) {
            const geometry = child.geometry;
            vertices += geometry.attributes.position.count;

            if (child.isMesh) {
              if (geometry.index !== null) {
                triangles += geometry.index.count / 3;
              } else {
                triangles += geometry.attributes.position.count / 3;
              }
            }
          }
        });
      }

      objectCol.setTextContent(objLabel + objects);
      verticesCol.setTextContent(vecLabel + vertices);
      trianglesCol.setTextContent(triLabel + triangles);
    };

    editor.signals.sceneRendered.add((frameTime) => {
      frameTimeCol.setTextContent(famLabel + frameTime.toFixed(2) + " ms");
    });

    editor.signals.objectAdded.add(this.update);

    this.showStats = function () {
      dom.show();
      this.update();
    };

    this.hideStats = function () {
      dom.hide();
    };
  }
}

export { Stats };
