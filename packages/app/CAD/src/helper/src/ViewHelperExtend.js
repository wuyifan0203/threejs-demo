/*
 * @Date: 2023-06-16 00:45:30
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-20 17:04:47
 * @FilePath: /threejs-demo/packages/app/CAD/src/helper/src/ViewHelperExtend.js
 */
import { ViewHelper as ViewHelperBase } from "./ViewHelper";

class ViewHelper extends ViewHelperBase {
  constructor(editorCamera, container) {
    super(editorCamera, container);

    const viewHelperDom = document.createElement("div");
    viewHelperDom.setAttribute("id", "viewHelper");

    const style = {
      position: "absolute",
      right: "0px",
      bottom: "0px",
      height: "128px",
      width: "128px",
    };
    Object.assign(viewHelperDom.style, style);
    container.append(viewHelperDom);

    viewHelperDom.addEventListener("pointerup", (event) => {
      event.stopPropagation();


      this.handleClick(event);
    });

    viewHelperDom.addEventListener("pointerdown", function (event) {
      event.stopPropagation();
    });
  }
}

export { ViewHelper };
