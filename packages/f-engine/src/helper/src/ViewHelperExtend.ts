/*
 * @Date: 2023-06-16 00:45:30
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-29 17:03:26
 * @FilePath: /threejs-demo/packages/app/CAD/src/helper/src/ViewHelperExtend.js
 */
import { ViewHelper as ViewHelperBase } from './ViewHelper';
import { UIDiv } from '../../utils/ui';

class ViewHelper extends ViewHelperBase {
  constructor(editorCamera, container) {
    super(editorCamera, container);

    const dom = new UIDiv();
    dom.setId('viewHelper');
    dom.setStyle({
      position: 'absolute',
      right: '0px',
      bottom: '0px',
      height: '128px',
      width: '128px',
    });
    container.append(dom.domElement);

    dom.domElement.addEventListener('pointerup', (event) => {
      event.stopPropagation();

      this.handleClick(event);
    });

    dom.domElement.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
    });
  }
}

export { ViewHelper };
