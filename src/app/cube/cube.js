/* eslint-disable no-unused-vars */
/*
 * @Date: 2023-01-05 18:14:24
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-01-31 18:11:34
 * @FilePath: /threejs-demo/src/examples/cube/cube.js
 */

import {
  Vector3,
  Scene,
  BoxBufferGeometry,
  Mesh,
  MeshPhongMaterial,
  MeshBasicMaterial,
  Group,
  Matrix4,
  LineBasicMaterial,
  EdgesGeometry,
  LineSegments,
  Color,
} from '../../lib/three/three.module.js';

const lineMaterial = new LineBasicMaterial({ color: '#000000' });

const colors = [
  '#ff1e02',
  '#ffc12a',
  '#ffff3a',
  '#ffffff',
  '#00af57',
  '#00afee',
];
function Cube(level, size, offset = 0) {
  this.level = level;
  this.h = this.w = this.d = level;
  this.size = size;
  this.offset = offset;
  this.currentRow = new Group();
  return this.createCube();
}

function getMaterial(index) {
  return new MeshBasicMaterial({
    depthTest: true,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    color: colors[index],
  });
}

Cube.prototype.createCube = function () {
  const geometry = new BoxBufferGeometry(this.size, this.size, this.size);
  const materials = [
    getMaterial(0),
    getMaterial(1),
    getMaterial(2),
    getMaterial(3),
    getMaterial(4),
    getMaterial(5),
  ];
  // console.log(materials);
  const group = new Group();
  for (let i = 0; i < this.d; i++) {
    for (let j = 0; j < this.w * this.h; j++) {
      const mesh = new Mesh(geometry, materials);
      const [w, h, d] = [Math.floor(j / this.level), j % this.level, i];
      mesh.userData.index = [w, h, d];
      mesh.name = `${w}-${h}-${d}`;
      this.getPosition(mesh);
      this.getEdge(mesh);
      group.add(mesh);
    }
  }
  this.makeGroup(group);
  return group;
};

Cube.prototype.getPosition = function (mesh) {
  const [w, h, d] = mesh.userData.index;
  const { level } = this;
  function getRealIndex(num) {
    const center = Math.floor(level / 2);
    return num - center;
  }
  const x = getRealIndex(w, level) * (this.size + this.offset);
  const y = getRealIndex(h, level) * (this.size + this.offset);
  const z = getRealIndex(d, level) * (this.size + this.offset);

  mesh.applyMatrix4(new Matrix4().makeTranslation(x, y, z));
};

Cube.prototype.makeGroup = function (group) {
  this.width = {};
  this.height = {};
  this.depth = {};
  const matrix = makeMatrix(group.children, this.level);

  console.log(matrix);
};

Cube.prototype.getEdge = function (mesh) {
  const edge = new EdgesGeometry(mesh.geometry);
  mesh.add(new LineSegments(edge, lineMaterial));
};

Cube.prototype.rotate = function (direction, index) {

};

function makeMatrix(children, level) {
  if (children.length <= 1 || level === 1) return [];
  const matrix = [];
  for (let i = 0; i < level; i++) {
    matrix.push([]);
    for (let j = 0; j < level; j++) {
      matrix[i].push([]);
      for (let k = 0; k < level; k++) {
        matrix[i][j].push(children[i + j + k]);
      }
    }
  }
  return matrix;
}

export { Cube };
