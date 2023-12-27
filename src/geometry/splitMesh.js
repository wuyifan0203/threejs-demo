/*
 * @Date: 2023-04-13 13:42:58
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-12-27 17:24:55
 * @FilePath: /threejs-demo/src/geometry/splitMesh.js
 */
import {
  Vector3,
  Mesh,
  MeshNormalMaterial,
  Plane,
  BufferGeometry,
  Line3,
  LineSegments,
  LineBasicMaterial,
  TorusGeometry,
  SphereGeometry,
} from '../lib/three/three.module.js';
import {
  initRenderer,
  initPerspectiveCamera,
  initAxesHelper,
  resize,
  initScene,
  initGUI,
  initOrbitControls
} from '../lib/tools/index.js';
import { ViewHelper } from '../lib/three/viewHelper.js';

const { EPSILON } = Number;

window.onload = () => {
  init();
};

function init() {
  const renderer = initRenderer();
  const camera = initPerspectiveCamera(new Vector3(14, -16, 13));
  const scene = initScene();
  renderer.setClearColor(0xffffff);
  renderer.autoClear = false;
  camera.up.set(0, 0, 1);
  resize(renderer, camera);
  initAxesHelper(scene);

  const controls = initOrbitControls(camera, renderer.domElement);
  const viewHelper = new ViewHelper(camera, renderer.domElement);

  draw(scene);

  function render() {
    renderer.clear();
    controls.update();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
  }

  renderer.setAnimationLoop(render);
}

function draw(scene) {
  const torusGeometry = new TorusGeometry(8, 4, 3, 100, Math.PI * 2);
  const sphereGeometry = new SphereGeometry(4, 32, 64);
  const material = new MeshNormalMaterial({ side: 2, wireframe: true });
  const mesh = new Mesh(sphereGeometry, material);

  const planeNormal = new Vector3(0, 0, 1);
  const planePoint = new Vector3(0, 0, 0);

  scene.add(mesh);

  const getAllTriangles = (geometry) => {
    let vertex = [];
    const index = geometry?.index?.array;
    const position = geometry?.attributes?.position?.array;
    if (!position) {
      console.warn('no position');
      return [];
    }
    if (index) {
      for (let i = 0, { length } = index; i < length; i++) {
        const idx = index[i] * 3;
        vertex.push(position[idx]);
        vertex.push(position[idx + 1]);
        vertex.push(position[idx + 2]);
      }
    } else {
      vertex = Array.from(position);
    }
    return vertex;
  };

  function r(num) {
    return Number(num.toFixed(16));
  }

  function getDistanceFromPointToPlane(point, planeNormal, planePoint) {
    const { x: Nx, y: Ny, z: Nz } = planeNormal;
    const { x: Px, y: Py, z: Pz } = planePoint;
    const { x, y, z } = point;
    return (Nx * (x - Px) + Ny * (y - Py) + Nz * (z - Pz)) / Math.sqrt(Nx ** 2 + Ny ** 2 + Nz ** 2);
  }

  function isIntersectingPlane(geometry, planeNormal, planePoint) {
    const triangles = getAllTriangles(geometry);
    // console.log(triangles);
    const intersecting = [];
    for (let i = 0, { length } = triangles; i < length; i += 9) {
      const point1 = new Vector3(r(triangles[i]), r(triangles[i + 1]), r(triangles[i + 2]));
      const point2 = new Vector3(r(triangles[i + 3]), r(triangles[i + 4]), r(triangles[i + 5]));
      const point3 = new Vector3(r(triangles[i + 6]), r(triangles[i + 7]), r(triangles[i + 8]));

      // if (i === triangles.length - 9) {
      //   debugger
      // }
      // debugger
      filterTriangle(point1, point2, point3, planeNormal, planePoint, intersecting);
      // console.log(intersecting);
    }
    return intersecting;
  }
  const isSame = (a, b) => Math.abs(a - b) < 1e-14;
  // a > b
  const greaterThan = (a, b) => a > (b + 0);
  // a < b
  const lessThan = (a, b) => a < (b - 0);

  const rounds = (num) => (Math.abs(num) < EPSILON ? 0 : num);

  const segments = [];

  function filterTriangle(pointA, pointB, pointC, planeNormal, planePoint, array) {
    const dis1 = rounds(getDistanceFromPointToPlane(pointA, planeNormal, planePoint));
    const dis2 = rounds(getDistanceFromPointToPlane(pointB, planeNormal, planePoint));
    const dis3 = rounds(getDistanceFromPointToPlane(pointC, planeNormal, planePoint));

    if (Number.isNaN(dis1) || Number.isNaN(dis2) || Number.isNaN(dis3)) {
      console.log('Nan => points', pointA, pointB, pointC);
      console.log('Nan => plane', planeNormal, planePoint);
    }

    const plane = new Plane().setFromNormalAndCoplanarPoint(planeNormal, planePoint);

    // 如果三点距离同时为正或者为负，则说明相离,如果三点都为0，说明共面，也需要排除
    // console.count('三角形个数');
    if (!checkPositiveOrNegative(dis1, dis2, dis3)) {
      // console.log('----------------------');
      // console.log('dis: ->', dis1, dis2, dis3);
      // 如果有两个点距离为0 ，说明这个三角形与平面相切
      const edge = checkEdgeOnPlane(dis1, dis2, dis3);
      const point = checkPointOnPlane(dis1, dis2, dis3);
      const temp = [pointA, pointB, pointC];
      // console.log('三角形 :', temp);
      if (edge.length) {
        // console.log('相切');
        // 相切逻辑

        const A = formatVector3(temp[edge[0]]);
        const B = formatVector3(temp[edge[1]]);

        if (!checkIsSameSegment([A, B])) {
          array.push(A, B);
          segments.push([A, B]);
        }
      } else if (point[0].length) {
        // 相交一个点
        // console.log('相切-个点');
        const line = new Line3(temp[point[1][0]], temp[point[1][1]]);
        const insertPoint = new Vector3();
        plane.intersectLine(line, insertPoint);

        const A = formatVector3(temp[point[0][0]]);
        const B = formatVector3(insertPoint);

        if (!checkIsSameSegment([A, B])) {
          array.push(A, B);
          segments.push([A, B]);
        }
      } else {
        // console.log('相交两个点');
        // 相交于两个线段
        const segment = checkSegmentOnPlane(dis1, dis2, dis3);
        const line1 = new Line3(temp[segment[0][0]], temp[segment[0][1]]);
        const line2 = new Line3(temp[segment[1][0]], temp[segment[1][1]]);
        const insertPoint1 = new Vector3();
        const insertPoint2 = new Vector3();
        plane.intersectLine(line1, insertPoint1);
        plane.intersectLine(line2, insertPoint2);

        const A = formatVector3(insertPoint1);
        const B = formatVector3(insertPoint2);

        if (!checkIsSameSegment([A, B])) {
          array.push(A, B);
          segments.push([A, B]);
        }
      }
    }
  }

  function isSeparation(a, b, c) {
    return (greaterThan(a, 0) && greaterThan(b, 0) && greaterThan(c, 0)) || (lessThan(a, 0) && lessThan(b, 0) && lessThan(c, 0));
  }

  function isOnPlane(a, b, c) {
    return (isSame(a, 0) && isSame(b, 0) && isSame(c, 0));
  }

  function isTangentOnPoint(a, b, c) {
    return (isSame(a, 0) && greaterThan(b * c, 0)) || (isSame(b, 0) && greaterThan(a * c, 0)) || (isSame(c, 0) && greaterThan(a * b, 0));
  }

  function checkPositiveOrNegative(a, b, c) {
    const s = isSeparation(a, b, c);
    const o = isOnPlane(a, b, c);
    const t = isTangentOnPoint(a, b, c);
    return s || o || t;
  }

  function checkEdgeOnPlane(a, b, c) {
    if (isSame(a, 0) && isSame(b, 0)) {
      return [0, 1];
    } if (isSame(a, 0) && isSame(c, 0)) {
      return [0, 2];
    } if (isSame(b, 0) && isSame(c, 0)) {
      return [1, 2];
    }
    return [];
  }

  function checkPointOnPlane(a, b, c) {
    if (isSame(a, 0)) {
      return [[0], [1, 2]];
    } if (isSame(b, 0)) {
      return [[1], [0, 2]];
    } if (isSame(c, 0)) {
      return [[2], [0, 1]];
    }
    return [[], []];
  }

  function checkSegmentOnPlane(a, b, c) {
    if ((a > 0 && b < 0 & c < 0) || (a < 0 && b > 0 & c > 0)) {
      return [[0, 1], [0, 2]];
    } if ((a < 0 && b > 0 & c < 0) || (a > 0 && b < 0 & c > 0)) {
      return [[1, 2], [0, 1]];
    } if ((a < 0 && b < 0 & c > 0) || (a > 0 && b > 0 & c < 0)) {
      return [[1, 2], [0, 2]];
    }
    console.error('boom !');

    return [[], []];
  }

  function checkIsSameSegment(value) {
    if (segments.length === 0) {
      return false;
    }
    for (let index = 0, { length } = segments; index < length; index++) {
      const comparer = segments[index];
      const result = isSameLines(value, comparer);
      if (result) {
        return true;
      }
    }
    return false;
  }

  function isSameLines(l1, l2) {
    // l1与l2头与头相比，尾与尾相比
    const positiveOrder = compareLines(l1[0], l1[1], l2[0], l2[1]);
    // l1与l2头与尾相比
    const negativeOrder = compareLines(l1[1], l1[0], l2[0], l2[1]);
    return positiveOrder || negativeOrder;
  }

  function compareLines(l1A, l1B, l2A, l2B) {
    const isHeadSame = isSame(l1A.x, l2A.x) && isSame(l1A.y, l2A.y) && isSame(l1A.z, l2A.z);
    const isBottomSame = isSame(l1B.x, l2B.x) && isSame(l1B.y, l2B.y) && isSame(l1B.z, l2B.z);
    return isHeadSame && isBottomSame;
  }

  function formatVector3(vec3) {
    return vec3.set(
      Math.abs(vec3.x) < 1e-14 ? 0 : vec3.x,
      Math.abs(vec3.y) < 1e-14 ? 0 : vec3.y,
      Math.abs(vec3.z) < 1e-14 ? 0 : vec3.z,
    );
  }

  const res = isIntersectingPlane(sphereGeometry, planeNormal, planePoint);
  // console.log('result ->', res);

  // console.log('segments -> ', segments);

  function sortSegmentToLoop(segment) {
    const result = [[]];
    const remainingSegments = [...segment];

    let currentSegment = remainingSegments.shift();
    let loop = result[0];
    loop.push(currentSegment);

    while (remainingSegments.length > 0) {
      const { index, order } = findJoinableSegmentIndex(currentSegment, remainingSegments);
      // 如果找不到可拼接的线段，则回路无法完成
      if (index === -1) {
        if (areLoopConnectivity(currentSegment, loop[0])) {
          if (remainingSegments.length > 0) {
            loop = [];
            result.push(loop);
            currentSegment = remainingSegments.shift();
            loop.push(currentSegment);
            continue;
          } if (remainingSegments.length === 0) {
            return result;
          }
        } else {
          console.warn('找不到对应的点，无法形成回路');
          return result;
        }
      }
      const nextSegment = remainingSegments.splice(index, 1)[0];
      if (order === 1) {
        loop.push(nextSegment);
      } else {
        loop.push(nextSegment.reverse());
      }
      currentSegment = nextSegment;
    }

    return result;
  }

  function areSegmentsJoinable(segment1, segment2) {
    const { x: x2, y: y2 } = segment1[1];
    const { x: x3, y: y3 } = segment2[0];
    const { x: x4, y: y4 } = segment2[1];
    let order = 0;
    const positiveOrder = (Math.abs(x2 - x3) <= 1e-14 && Math.abs(y2 - y3) <= 1e-14);
    const negativeOrder = (Math.abs(x2 - x4) <= 1e-14 && Math.abs(y2 - y4) <= 1e-14);
    if (positiveOrder) {
      order = 1;
    } else if (negativeOrder) {
      order = -1;
    }

    return {
      enable: positiveOrder || negativeOrder,
      order,
    };
  }

  function findJoinableSegmentIndex(currentSegment, remainingSegments) {
    for (let i = 0; i < remainingSegments.length; i++) {
      const nextSegment = remainingSegments[i];
      const { order, enable } = areSegmentsJoinable(currentSegment, nextSegment);
      if (enable) {
        return {
          index: i,
          order,
        };
      }
    }
    return {
      index: -1,
      order: 0,
    };
  }

  function areLoopConnectivity(segment1, segment2) {
    const { x: x1, y: y1 } = segment1[0];
    const { x: x2, y: y2 } = segment1[1];
    const { x: x3, y: y3 } = segment2[0];
    const { x: x4, y: y4 } = segment2[1];

    const condition1 = (Math.abs(x1 - x3) <= 1e-14 && Math.abs(y1 - y3) <= 1e-14);
    const condition2 = (Math.abs(x1 - x4) <= 1e-14 && Math.abs(y1 - y4) <= 1e-14);
    const condition3 = (Math.abs(x2 - x3) <= 1e-14 && Math.abs(y2 - y3) <= 1e-14);
    const condition4 = (Math.abs(x2 - x4) <= 1e-14 && Math.abs(y2 - y4) <= 1e-14);

    return condition1 || condition2 || condition3 || condition4;
  }

  function formateLoops(loops) {
    const areas = loops.map((loop) => getLoopArea(loop));
    const bodyIndex = getBodyIndex(areas);

    const holes = [];
    for (let index = 0; index < loops.length; index++) {
      if (index === bodyIndex) {
        continue;
      }
      holes.push(convertLoopDirection(loops[index], 'C'));
    }

    return {
      body: convertLoopDirection(loops[bodyIndex], 'AC'),
      holes,
    };
  }

  // eslint-disable-next-line consistent-return
  function convertLoopDirection(loop, direction = 'AC') {
    const last = loop.at(-1);
    const first = loop[0];
    const subA = new Vector3();
    const subB = new Vector3();
    subA.subVectors(last[0], last[1]);
    subB.subVectors(first[1], first[0]);
    let sum = crossProduct(subA, subB);
    for (let i = 1; i < loop.length; i++) {
      const pre = loop[i - 1];
      const current = loop[i];
      subA.subVectors(pre[0], pre[1]);
      subB.subVectors(current[1], current[0]);
      sum += crossProduct(subA, subB);
    }

    if (direction === 'AC') {
      if (sum > 0) {
        return loop;
      } if (sum < 0) {
        loop.reverse();
        loop.forEach((segment) => {
          segment.reverse();
        });
        return loop;
      }
    } else {
      if (sum > 0) {
        loop.reverse();
        loop.forEach((segment) => {
          segment.reverse();
        });
        return loop;
      } if (sum < 0) {
        return loop;
      }
    }
  }

  function crossProduct(v1, v2) {
    const { x: v1x, y: v1y } = v1;
    const { x: v2x, y: v2y } = v2;
    return v1x * v2y - v2x * v1y;
  }

  function getLoopArea(loop) {
    const { max, min } = Math;
    let [xMax, xMin, yMax, yMin] = [0, 0, 0, 0]
    for (let index = 0, { length } = loop; index < length; index++) {
      const { x, y } = loop[index][0];
      xMin = min(x, xMin);
      xMax = max(x, xMax);
      yMin = min(y, yMin);
      yMax = max(y, yMax);
    }

    return (xMax - xMin) * (yMax - yMin);
  }

  function getBodyIndex(areas) {
    let index; let
      max = 0;
    for (let i = 0, { length } = areas; i < length; i++) {
      if (max < areas[i]) {
        max = areas[i];
        index = i;
      }
    }
    return index;
  }

  const loops = sortSegmentToLoop(segments);

  console.log('sortSegmentToLoop result ->', loops);

  // const final = formateLoops(loops);

  const lineMesh = new LineSegments(new BufferGeometry().setFromPoints(res), new LineBasicMaterial({ color: '#000000', side: 2 }));

  scene.add(lineMesh);

  const control = {
    planeNormal,
    planePoint,
    sphereGeometry,
    torusGeometry,
    geometry: 'sphereGeometry',
  };

  const gui = initGUI();

  const planeNormalFolder = gui.addFolder('Plane Normal');
  planeNormalFolder.add(control.planeNormal, 'x', -1, 1, 0.1).onChange(() => {
    updateSplitMeshLine();
  });
  planeNormalFolder.add(control.planeNormal, 'y', -1, 1, 0.1).onChange(() => {
    updateSplitMeshLine();
  });
  planeNormalFolder.add(control.planeNormal, 'z', -1, 1, 0.1).onChange(() => {
    updateSplitMeshLine();
  });

  const planePointFolder = gui.addFolder('Plane Point');
  planePointFolder.add(control.planePoint, 'x', -3, 3, 0.1).onChange(() => {
    updateSplitMeshLine();
  });
  planePointFolder.add(control.planePoint, 'y', -3, 3, 0.1).onChange(() => {
    updateSplitMeshLine();
  });
  planePointFolder.add(control.planePoint, 'z', -3, 3, 0.1).onChange(() => {
    updateSplitMeshLine();
  });

  const MeshFolder = gui.addFolder('Mesh Folder');
  MeshFolder.add(control, 'geometry', ['sphereGeometry', 'torusGeometry']).onChange(() => {
    updateSplitMeshLine();
  });
  MeshFolder.add(mesh, 'visible').name('Target Mesh visible');

  function updateSplitMeshLine() {
    segments.length = 0;
    mesh.geometry = control[control.geometry];
    const segmentUnOrder = isIntersectingPlane(mesh.geometry, control.planeNormal, control.planePoint);
    lineMesh.geometry.setFromPoints(segmentUnOrder);
    lineMesh.geometry.attributes.position.needsUpdate = true;
    const loops = sortSegmentToLoop(segments);
    const result = formateLoops(loops);
    console.log(result);
  }
}
