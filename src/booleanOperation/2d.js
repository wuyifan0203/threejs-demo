/*
 * @Date: 2023-05-25 10:56:19
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-25 00:40:43
 * @FilePath: /threejs-demo/examples/src/booleanOperation/2d.js
 */
import { PolyBool } from '../lib/other/PolyBool.js';

function name(params) {
  const res = PolyBool.intersect({
      regions: [
        [[50,50], [150,150], [190,50]],
        [[130,50], [290,150], [290,50]]
      ],
      inverted: false
    }, {
      regions: [
        [[110,20], [110,110], [20,20]],
        [[130,170], [130,20], [260,20], [260,170]]
      ],
      inverted: false
    });;

    console.log(res);
}

name();
