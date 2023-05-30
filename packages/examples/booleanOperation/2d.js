/*
 * @Date: 2023-05-25 10:56:19
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-05-25 19:46:15
 * @FilePath: /threejs-demo/packages/examples/booleanOperation/2d.js
 */
import { PolyBool } from '../../lib/other/PolyBool.js';

import { paper } from './paper-core.js';

const { PathItem, Path } = paper;

console.log(PathItem, Path);

function name(params) {
  // const res = PolyBool.intersect({
  //     regions: [
  //       [[50,50], [150,150], [190,50]],
  //       [[130,50], [290,150], [290,50]]
  //     ],
  //     inverted: false
  //   }, {
  //     regions: [
  //       [[110,20], [110,110], [20,20]],
  //       [[130,170], [130,20], [260,20], [260,170]]
  //     ],
  //     inverted: false
  //   });

  const path1 = new Path({
    segments: [[100, 100], [200, 100], [200, 200], [100, 200]],
    closed: true,
  });

  const path2 = new Path({
    segments: [[150, 150], [250, 150], [250, 250], [150, 250]],
    closed: true,
  });

  const intersection = path1.intersect(path2);
  intersection.fillColor = '#00FF80';

  console.log(intersection);
}

name();
