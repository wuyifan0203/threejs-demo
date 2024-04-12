import type { Material, BufferAttribute } from 'three';
import { Vector3, Matrix3, BufferGeometry, Matrix4, Mesh, Float32BufferAttribute } from 'three';

class CSG {
  polygons: Polygon[];

  constructor() {
    this.polygons = [];
  }
  clone() {
    const csg = new CSG();
    csg.polygons = this.polygons.map((p) => p.clone());
    return csg;
  }

  toPolygons() {
    return this.polygons;
  }

  union(csg: CSG) {
    const a = new Node(this.clone().polygons);
    const b = new Node(csg.clone().polygons);
    a.clipTo(b);
    b.clipTo(a);
    b.invert();
    b.clipTo(a);
    b.invert();
    a.build(b.allPolygons());
    return CSG.fromPolygons(a.allPolygons());
  }

  subtract(csg: CSG) {
    const a = new Node(this.clone().polygons);
    const b = new Node(csg.clone().polygons);
    a.invert();
    a.clipTo(b);
    b.clipTo(a);
    b.invert();
    b.clipTo(a);
    b.invert();
    a.build(b.allPolygons());
    a.invert();
    return CSG.fromPolygons(a.allPolygons());
  }

  intersect(csg: CSG) {
    const a = new Node(this.clone().polygons);
    const b = new Node(csg.clone().polygons);
    a.invert();
    b.clipTo(a);
    b.invert();
    a.clipTo(b);
    b.clipTo(a);
    a.build(b.allPolygons());
    a.invert();
    return CSG.fromPolygons(a.allPolygons());
  }

  inverse() {
    const csg = this.clone();
    csg.polygons.forEach((p) => p.flip());
    return csg;
  }

  static fromPolygons = function (polygons: Polygon[]) {
    const csg = new CSG();
    csg.polygons = polygons;
    return csg;
  };

  static fromGeometry = function (geom: BufferGeometry, objectIndex?: number) {
    let polys: Polygon[] = [];
    const posAttr = geom.attributes.position as BufferAttribute;
    const normalAttr = geom.attributes.normal as BufferAttribute;
    const uvAttr = geom.attributes.uv as BufferAttribute;
    const colorAttr = geom.attributes.color as BufferAttribute;
    let index;
    if (geom.index) index = geom.index.array;
    else {
      index = new Array((posAttr.array.length / posAttr.itemSize) | 0);
      for (let i = 0; i < index.length; i++) index[i] = i;
    }
    const triCount = (index.length / 3) | 0;
    polys = new Array(triCount);
    for (let i = 0, pli = 0, l = index.length; i < l; i += 3, pli++) {
      const vertices = new Array(3);
      for (let j = 0; j < 3; j++) {
        const vi = index[i + j];
        const vp = vi * 3;
        const vt = vi * 2;
        const x = posAttr.array[vp];
        const y = posAttr.array[vp + 1];
        const z = posAttr.array[vp + 2];
        const nx = normalAttr.array[vp];
        const ny = normalAttr.array[vp + 1];
        const nz = normalAttr.array[vp + 2];
        vertices[j] = new Vertex(
          { x, y, z } as Vector, // position
          { x: nx, y: ny, z: nz } as Vector, // normal
          uvAttr && ({ x: uvAttr.array[vt], y: uvAttr.array[vt + 1], z: 0 } as Vector), // uv
          colorAttr &&
            ({
              x: colorAttr.array[vt],
              y: colorAttr.array[vt + 1],
              z: colorAttr.array[vt + 2],
            } as Vector),
        );
      }
      polys[pli] = new Polygon(vertices, objectIndex);
    }

    // console.log(polys, 'fromGeometry');

    return CSG.fromPolygons(polys);
  };

  private static tmpV3 = new Vector3();
  private static tmpMatrix3 = new Matrix3();

  static fromMesh = function (mesh: Mesh, objectIndex?: number) {
    const csg = CSG.fromGeometry(mesh.geometry, objectIndex);
    CSG.tmpMatrix3.getNormalMatrix(mesh.matrix);
    for (let i = 0; i < csg.polygons.length; i++) {
      const p = csg.polygons[i];
      for (let j = 0; j < p.vertices.length; j++) {
        const v = p.vertices[j];
        v.pos.copy(
          CSG.tmpV3.copy(new Vector3(v.pos.x, v.pos.y, v.pos.z)).applyMatrix4(mesh.matrix),
        );
        v.normal.copy(
          CSG.tmpV3
            .copy(new Vector3(v.normal.x, v.normal.y, v.normal.z))
            .applyMatrix3(CSG.tmpMatrix3),
        );
      }
    }
    return csg;
  };

  static createVector3Buffer = (arrayLength: number) => {
    return {
      top: 0,
      array: new Array(arrayLength) as number[],
      write: function (v: Vector) {
        this.array[this.top++] = v.x;
        this.array[this.top++] = v.y;
        this.array[this.top++] = v.z;
      },
    };
  };
  static createVector2Buffer = (arrayLength: number) => {
    return {
      top: 0,
      array: new Array(arrayLength) as number[],
      write: function (v: Vector) {
        this.array[this.top++] = v.x;
        this.array[this.top++] = v.y;
      },
    };
  };

  static toGeometry = function (csg: CSG) {
    const { vertices, normals, uvs, colors, grps } = CSG.toBufferAttribute(csg);

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(vertices.array, 3));
    geometry.setAttribute('normal', new Float32BufferAttribute(normals.array, 3));
    uvs && geometry.setAttribute('uv', new Float32BufferAttribute(uvs.array, 2));
    colors && geometry.setAttribute('color', new Float32BufferAttribute(colors.array, 3));

    if (Object.keys(grps).length) {
      let index: any[] = [];
      let base = 0;
      for (let gi = 0; gi < Object.keys(grps).length; gi++) {
        const key = Number(Object.keys(grps)[gi]);
        geometry.addGroup(base, grps[key].length, gi);
        base += grps[key].length;
        index = index.concat(grps[key]);
        geometry.setIndex(index);
      }
    }

    return geometry;
  };

  static toBufferAttribute = function (csg: CSG) {
    const ps = csg.polygons;

    let triCount = 0;
    ps.forEach((p) => (triCount += p.vertices.length - 2));

    const vertices = CSG.createVector3Buffer(triCount * 3 * 3);
    const normals = CSG.createVector3Buffer(triCount * 3 * 3);

    let uvs: any;
    let colors: any;
    const grps: { [key: number]: number[] } = {};

    ps.forEach((p) => {
      const pvs = p.vertices;
      const length = pvs.length;
      if (p.shared !== undefined) {
        if (!grps[p.shared]) grps[p.shared] = [];
      }

      if (length) {
        if (pvs[0].color !== undefined) {
          if (!colors) colors = CSG.createVector3Buffer(triCount * 3 * 3);
        }
        if (pvs[0].uv !== undefined) {
          if (!uvs) uvs = CSG.createVector2Buffer(triCount * 2 * 3);
        }
      }
      for (let j = 3; j <= length; j++) {
        p.shared !== undefined &&
          grps[p.shared].push(vertices.top / 3, vertices.top / 3 + 1, vertices.top / 3 + 2);
        vertices.write(pvs[0].pos);
        vertices.write(pvs[j - 2].pos);
        vertices.write(pvs[j - 1].pos);
        normals.write(pvs[0].normal);
        normals.write(pvs[j - 2].normal);
        normals.write(pvs[j - 1].normal);
        uvs &&
          pvs[0].uv &&
          (uvs.write(pvs[0].uv) || uvs.write(pvs[j - 2].uv) || uvs.write(pvs[j - 1].uv));
        colors &&
          (colors.write(pvs[0].color) ||
            colors.write(pvs[j - 2].color) ||
            colors.write(pvs[j - 1].color));
      }
    });

    return {
      vertices,
      normals,
      grps,
      uvs,
      colors,
    };
  };

  static toMesh = function (csg: CSG, toMatrix: Matrix4, toMaterial?: Material | Material[]) {
    const geom = CSG.toGeometry(csg);

    const inv = new Matrix4().copy(toMatrix).invert();
    geom.applyMatrix4(inv);
    geom.computeBoundingSphere();
    geom.computeBoundingBox();
    const m = new Mesh(geom, toMaterial);
    m.matrix.copy(toMatrix);
    m.matrix.decompose(m.position, m.quaternion, m.scale);
    m.rotation.setFromQuaternion(m.quaternion);
    m.updateMatrixWorld();
    m.castShadow = m.receiveShadow = true;
    return m;
  };
}

class Vector {
  x: number;
  y: number;
  z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  copy(v: any) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }
  clone() {
    return new Vector(this.x, this.y, this.z);
  }
  negate() {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
    return this;
  }
  add(a: Vector) {
    this.x += a.x;
    this.y += a.y;
    this.z += a.z;
    return this;
  }
  sub(a: Vector) {
    this.x -= a.x;
    this.y -= a.y;
    this.z -= a.z;
    return this;
  }
  times(a: number) {
    this.x *= a;
    this.y *= a;
    this.z *= a;
    return this;
  }
  dividedBy(a: number) {
    this.x /= a;
    this.y /= a;
    this.z /= a;
    return this;
  }
  lerp(a: Vector, t: number) {
    return this.add(Vector.tv0.copy(a).sub(this).times(t));
  }
  unit() {
    return this.dividedBy(this.length());
  }
  length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }
  normalize() {
    return this.unit();
  }
  cross(b: Vector) {
    const [ax, ay, az] = [this.x, this.y, this.z];
    const [bx, by, bz] = [b.x, b.y, b.z];

    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;

    return this;
  }
  dot(b: Vector) {
    return this.x * b.x + this.y * b.y + this.z * b.z;
  }

  static tv0 = new Vector();
  static tv1 = new Vector();
}

class Vertex {
  pos: Vector;
  normal: Vector;
  uv?: Vector;
  color?: Vector;
  constructor(pos: Vector, normal: Vector, uv?: Vector, color?: Vector) {
    this.pos = new Vector().copy(pos);
    this.normal = new Vector().copy(normal);
    uv && (this.uv = new Vector().copy(uv)) && (this.uv.z = 0);
    color && (this.color = new Vector().copy(color));
  }

  clone() {
    return new Vertex(this.pos, this.normal, this.uv, this.color);
  }

  // 翻转
  flip() {
    this.normal.negate();
  }

  // 插值
  interpolate(other: Vertex, t: number) {
    return new Vertex(
      this.pos.clone().lerp(other.pos, t),
      this.normal.clone().lerp(other.normal, t),
      this.uv && other.uv && this.uv.clone().lerp(other.uv, t),
      this.color && other.color && this.color.clone().lerp(other.color, t),
    );
  }
}

class Plane {
  normal: Vector;
  w: number;
  private static COPLANAR = 0;
  private static FRONT = 1;
  private static BACK = 2;
  private static SPANNING = 3;
  constructor(normal: Vector, w: number) {
    this.normal = normal;
    this.w = w;
  }

  clone() {
    return new Plane(this.normal.clone(), this.w);
  }

  flip() {
    this.normal.negate();
    this.w = -this.w;
  }

  splitPolygon(
    polygon: Polygon,
    coplanarFront: Polygon[],
    coplanarBack: Polygon[],
    front: Polygon[],
    back: Polygon[],
  ) {
    let polygonType = 0;
    const types: Array<number> = [];
    for (let i = 0; i < polygon.vertices.length; i++) {
      const t = this.normal.dot(polygon.vertices[i].pos) - this.w;
      const type =
        t < -Plane.EPSILON ? Plane.BACK : t > Plane.EPSILON ? Plane.FRONT : Plane.COPLANAR;
      polygonType |= type;
      types.push(type);
    }

    switch (polygonType) {
      case Plane.COPLANAR:
        (this.normal.dot(polygon.plane.normal) > 0 ? coplanarFront : coplanarBack).push(polygon);
        break;
      case Plane.FRONT:
        front.push(polygon);
        break;
      case Plane.BACK:
        back.push(polygon);
        break;
      case Plane.SPANNING:
        const [f, b]: [Array<Vertex>, Array<Vertex>] = [[], []];
        for (let i = 0; i < polygon.vertices.length; i++) {
          const j = (i + 1) % polygon.vertices.length;
          const [ti, tj] = [types[i], types[j]];
          const [vi, vj] = [polygon.vertices[i], polygon.vertices[j]];
          if (ti != Plane.BACK) f.push(vi);
          if (ti != Plane.FRONT) b.push(ti != Plane.BACK ? vi.clone() : vi);

          if ((ti | tj) == Plane.SPANNING) {
            const t =
              (this.w - this.normal.dot(vi.pos)) /
              this.normal.dot(Vector.tv0.copy(vj.pos).sub(vi.pos));
            const v = vi.interpolate(vj, t);
            f.push(v);
            b.push(v.clone());
          }
        }
        if (f.length >= 3) front.push(new Polygon(f, polygon.shared));
        if (b.length >= 3) back.push(new Polygon(b, polygon.shared));
        break;
    }
  }

  static EPSILON = 1e-5;

  static fromPoints = function (a: Vector, b: Vector, c: Vector) {
    const n = Vector.tv0.copy(b).sub(a).cross(Vector.tv1.copy(c).sub(a)).normalize();
    return new Plane(n.clone(), n.dot(a));
  };
}

class Polygon {
  vertices: Vertex[];
  shared?: number;
  plane: Plane;

  constructor(vertices: Vertex[], shared?: number) {
    this.vertices = vertices;
    this.shared = shared;
    this.plane = Plane.fromPoints(vertices[0].pos, vertices[1].pos, vertices[2].pos);
  }
  clone() {
    return new Polygon(
      this.vertices.map((v) => v.clone()),
      this.shared,
    );
  }
  flip() {
    this.vertices.reverse().forEach((v) => v.flip());
    this.plane.flip();
  }
}

class Node {
  plane?: Plane;
  front?: Node;
  back?: Node;
  polygons: Polygon[];

  constructor(polygons?: Polygon[]) {
    this.polygons = [];
    if (polygons) this.build(polygons);
  }
  clone() {
    const node = new Node();
    node.plane = this.plane && this.plane.clone();
    node.front = this.front && this.front.clone();
    node.back = this.back && this.back.clone();
    node.polygons = this.polygons.map((p) => p.clone());
    return node;
  }

  invert() {
    for (let i = 0; i < this.polygons.length; i++) this.polygons[i].flip();

    this.plane && this.plane.flip();
    this.front && this.front.invert();
    this.back && this.back.invert();
    const temp = this.front;
    this.front = this.back;
    this.back = temp;
  }

  clipPolygons(polygons: Polygon[]) {
    if (!this.plane) return polygons.slice();
    let [front, back]: [Array<Polygon>, Array<Polygon>] = [[], []];
    for (let i = 0; i < polygons.length; i++) {
      this.plane.splitPolygon(polygons[i], front, back, front, back);
    }
    if (this.front) front = this.front.clipPolygons(front);
    if (this.back) back = this.back.clipPolygons(back);
    else back = [];

    return front.concat(back);
  }

  clipTo(bsp: Node) {
    this.polygons = bsp.clipPolygons(this.polygons);
    if (this.front) this.front.clipTo(bsp);
    if (this.back) this.back.clipTo(bsp);
  }

  allPolygons() {
    let polygons = this.polygons.slice();
    if (this.front) polygons = polygons.concat(this.front.allPolygons());
    if (this.back) polygons = polygons.concat(this.back.allPolygons());
    return polygons;
  }

  build(polygons: Polygon[]) {
    if (!polygons.length) return;
    if (!this.plane) this.plane = polygons[0].plane.clone();
    const [front, back]: [Array<Polygon>, Array<Polygon>] = [[], []];
    for (let i = 0; i < polygons.length; i++) {
      this.plane.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
    }
    if (front.length) {
      if (!this.front) this.front = new Node();
      this.front.build(front);
    }
    if (back.length) {
      if (!this.back) this.back = new Node();
      this.back.build(back);
    }
  }

  static fromJSON = function (json: CSG) {
    return CSG.fromPolygons(
      json.polygons.map(
        (p) =>
          new Polygon(
            p.vertices.map((v) => new Vertex(v.pos, v.normal, v.uv)),
            p.shared,
          ),
      ),
    );
  };
}

export { CSG, Vertex, Vector, Polygon, Plane };
