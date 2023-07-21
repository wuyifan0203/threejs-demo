/*
 * @Date: 2023-06-26 16:59:14
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-29 17:46:43
 * @FilePath: /threejs-demo/packages/app/CAD/src/helper/src/boxHelperExtend.js
 */
import { Box3Helper, BufferAttribute, Float16BufferAttribute } from 'three';

class Box3HelperExtend extends Box3Helper {
  constructor(box, color = 0xffff00) {
    super(box, color);

    const position = [

    ];

    const indices = [];

    this.geometry.setAttribute('position', new Float16BufferAttribute(position, 3));
    this.geometry.setIndex(new BufferAttribute(indices, 1));
  }
}

export {
  Box3HelperExtend,
};
