/*
 * @Date: 2023-06-16 00:45:30
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-10 20:52:18
 * @FilePath: /threejs-demo/packages/f-engine/src/helper/src/ViewHelperExtend.ts
 */
import { ViewHelper as ViewHelperBase } from './ViewHelper';
import { UIDiv } from '../../utils/ui';
import type { Camera } from 'three';

class ViewHelper extends ViewHelperBase {
  constructor(camera:Camera, domElement:HTMLElement) {
    super(camera, domElement);

    const dom = new UIDiv();
    dom.setId('viewHelper');
    dom.setStyle({
      position: 'absolute',
      right: '0px',
      bottom: '0px',
      height: '128px',
      width: '128px',
    });
    domElement.append(dom.domElement);

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
