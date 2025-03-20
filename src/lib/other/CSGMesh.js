/* eslint-disable no-use-before-define */
"use strict";
/**
 *
 * Copyright (c) 2011 Evan Wallace (http://madebyevan.com/), under the MIT license.
 * THREE.js rework by thrax
 *
 * # class CSG
 * Holds a binary space partition tree representing a 3D solid. Two solids can
 * be combined using the `union()`, `subtract()`, and `intersect()` methods.
 *
 * Differences Copyright 2020-2021 Sean Bradley : https://sbcode.net/threejs/
 * - Started with CSGMesh.js and csg-lib.js from https://github.com/manthrax/THREE-CSGMesh
 * - Converted to TypeScript by adding type annotations to all variables
 * - Converted var to const and let
 * - Some Refactoring
 * - support for three r130
 */
// exports.__esModule = true;
// exports.Plane = exports.Polygon = exports.Vector = exports.Vertex = exports.CSG = void 0;
import {
    Vector3, Matrix3, BufferGeometry, Matrix4, Mesh, Float32BufferAttribute
} from 'three';


const tmpV3 = new Vector3();
const tmpMatrix3 = new Matrix3();


class CSG {
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

    /**
     * @description: 求并集
     * @param {CSG} csg
     * @return {CSG}
     */
    union(csg) {
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

    /**
     * @description: 求差集
     * @param {CSG} csg
     * @return {CSG}
     */
    subtract(csg) {
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
    /**
     * @description: 求交集
     * @param {CSG} csg
     * @return {CSG}
     */
    intersect(csg) {
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

    /**
     * @description: 
     * @param {Array<Polygon>} polygons
     * @return {CSG}
     */
    static fromPolygons(polygons) {
        const csg = new CSG();
        csg.polygons = polygons;
        return csg;
    };

    /**
     * @description: 
     * @param {BufferGeometry} geom
     * @param {number} objectIndex ?
     * @return {*}
     */
    static fromGeometry(geom, objectIndex) {
        let polys = [];
        const posAttr = geom.attributes.position;
        const normalAttr = geom.attributes.normal;
        const uvAttr = geom.attributes.uv;
        const colorAttr = geom.attributes.color;
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
                    { x, y, z }, // position
                    { x: nx, y: ny, z: nz }, // normal
                    uvAttr && ({ x: uvAttr.array[vt], y: uvAttr.array[vt + 1], z: 0 }), // uv
                    colorAttr &&
                    ({
                        x: colorAttr.array[vt],
                        y: colorAttr.array[vt + 1],
                        z: colorAttr.array[vt + 2],
                    }),
                );
            }
            polys[pli] = new Polygon(vertices, objectIndex);
        }

        return CSG.fromPolygons(polys);
    };

    /**
     * @description: 
     * @param {Mesh} mesh
     * @param {Number} objectIndex
     * @return {CSG}
     */
    static fromMesh(mesh, objectIndex) {
        const csg = CSG.fromGeometry(mesh.geometry, objectIndex);
        tmpMatrix3.getNormalMatrix(mesh.matrix);
        for (let i = 0; i < csg.polygons.length; i++) {
            const p = csg.polygons[i];
            for (let j = 0; j < p.vertices.length; j++) {
                const v = p.vertices[j];
                v.position.copy(
                    tmpV3.copy(new Vector3(v.position.x, v.position.y, v.position.z)).applyMatrix4(mesh.matrix),
                );
                v.normal.copy(
                    tmpV3
                        .copy(new Vector3(v.normal.x, v.normal.y, v.normal.z))
                        .applyMatrix3(tmpMatrix3),
                );
            }
        }
        return csg;
    };

    /**
     * @description: 
     * @param {number} arrayLength
     * @return {*}
     */
    static createVector3Buffer(arrayLength) {
        return {
            top: 0,
            array: new Array(arrayLength),
            write(v) {
                this.array[this.top++] = v.x;
                this.array[this.top++] = v.y;
                this.array[this.top++] = v.z;
            },
        };
    };
    /**
      * @description: 
      * @param {number} arrayLength
      * @return {*}
      */
    static createVector2Buffer(arrayLength) {
        return {
            top: 0,
            array: new Array(arrayLength),
            write(v) {
                this.array[this.top++] = v.x;
                this.array[this.top++] = v.y;
            },
        };
    };

    /**
     * @description: 
     * @param {CSG} csg
     * @return {BufferGeometry}
     */
    static toGeometry(csg) {
        const {
            vertices, normals, uvs, colors, groups
        } = CSG.toBufferAttribute(csg);

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(vertices.array, 3));
        geometry.setAttribute('normal', new Float32BufferAttribute(normals.array, 3));
        uvs && geometry.setAttribute('uv', new Float32BufferAttribute(uvs.array, 2));
        colors && geometry.setAttribute('color', new Float32BufferAttribute(colors.array, 3));

        if (Object.keys(groups).length) {
            let index = [];
            let base = 0;
            for (let gi = 0; gi < Object.keys(groups).length; gi++) {
                const key = Number(Object.keys(groups)[gi]);
                geometry.addGroup(base, groups[key].length, gi);
                base += groups[key].length;
                index = index.concat(groups[key]);
                geometry.setIndex(index);
            }
        }

        return geometry;
    };

    /**
     * @description: 
     * @param {CSG} csg
     * @return {*}
     */
    static toBufferAttribute(csg) {
        const polygons = csg.polygons;

        let triCount = 0;
        polygons.forEach((p) => (triCount += p.vertices.length - 2));

        const vertices = CSG.createVector3Buffer(triCount * 3 * 3);
        const normals = CSG.createVector3Buffer(triCount * 3 * 3);

        let uvs;
        let colors;
        const groups = {};

        polygons.forEach((polygon) => {
            const currentVertices = polygon.vertices;
            const length = currentVertices.length;
            if (polygon.shared !== undefined) {
                if (!groups[polygon.shared]) groups[polygon.shared] = [];
            }

            if (length) {
                if (currentVertices[0].color !== undefined) {
                    if (!colors) colors = CSG.createVector3Buffer(triCount * 3 * 3);
                }
                if (currentVertices[0].uv !== undefined) {
                    if (!uvs) uvs = CSG.createVector2Buffer(triCount * 2 * 3);
                }
            }
            for (let j = 3; j <= length; j++) {
                polygon.shared !== undefined &&
                    groups[polygon.shared].push(vertices.top / 3, vertices.top / 3 + 1, vertices.top / 3 + 2);
                vertices.write(currentVertices[0].position);
                vertices.write(currentVertices[j - 2].position);
                vertices.write(currentVertices[j - 1].position);
                normals.write(currentVertices[0].normal);
                normals.write(currentVertices[j - 2].normal);
                normals.write(currentVertices[j - 1].normal);
                uvs &&
                    currentVertices[0].uv &&
                    (uvs.write(currentVertices[0].uv) || uvs.write(currentVertices[j - 2].uv) || uvs.write(currentVertices[j - 1].uv));
                colors &&
                    (colors.write(currentVertices[0].color) ||
                        colors.write(currentVertices[j - 2].color) ||
                        colors.write(currentVertices[j - 1].color));
            }
        });

        return {
            vertices,
            normals,
            groups,
            uvs,
            colors,
        };
    };

    /**
     * @description: 
     * @param {CSG} csg
     * @param {Matrix4} toMatrix
     * @param {Material|Material[]} toMaterial
     * @return {Mesh}
     */
    static toMesh = function (csg, toMatrix, toMaterial) {
        const geom = CSG.toGeometry(csg);

        const inv = new Matrix4().copy(toMatrix).invert();
        geom.applyMatrix4(inv);
        geom.computeBoundingSphere();
        geom.computeBoundingBox();
        const mesh = new Mesh(geom, toMaterial);
        mesh.matrix.copy(toMatrix);
        mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
        mesh.rotation.setFromQuaternion(mesh.quaternion);
        mesh.updateMatrixWorld();
        return mesh;
    };
}

class Vector {

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    copy(v) {
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
    add(a) {
        this.x += a.x;
        this.y += a.y;
        this.z += a.z;
        return this;
    }
    sub(a) {
        this.x -= a.x;
        this.y -= a.y;
        this.z -= a.z;
        return this;
    }
    times(a) {
        this.x *= a;
        this.y *= a;
        this.z *= a;
        return this;
    }
    dividedBy(a) {
        this.x /= a;
        this.y /= a;
        this.z /= a;
        return this;
    }
    lerp(a, t) {
        return this.add(tv0.copy(a).sub(this).times(t));
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
    cross(b) {
        const [ax, ay, az] = [this.x, this.y, this.z];
        const [bx, by, bz] = [b.x, b.y, b.z];

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;

        return this;
    }
    dot(b) {
        return this.x * b.x + this.y * b.y + this.z * b.z;
    }
}

const tv0 = new Vector();
const tv1 = new Vector();
class Vertex {
    constructor(position, normal, uv, color) {
        this.position = new Vector().copy(position);
        this.normal = new Vector().copy(normal);
        uv && (this.uv = new Vector().copy(uv)) && (this.uv.z = 0);
        color && (this.color = new Vector().copy(color));
    }

    clone() {
        return new Vertex(this.position, this.normal, this.uv, this.color);
    }

    // 翻转
    flip() {
        this.normal.negate();
    }

    // 插值
    interpolate(other, t) {
        return new Vertex(
            this.position.clone().lerp(other.position, t),
            this.normal.clone().lerp(other.normal, t),
            this.uv && other.uv && this.uv.clone().lerp(other.uv, t),
            this.color && other.color && this.color.clone().lerp(other.color, t),
        );
    }
}
class Polygon {

    /**
     * @description: 
     * @param {Vertex[]} vertices
     * @param {number} shared
     * @return {*}
     */
    constructor(vertices, shared) {
        this.vertices = vertices;
        this.shared = shared;

        this.plane = Plane.fromPoints(vertices[0].position, vertices[1].position, vertices[2].position);
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

class Plane {
    static COPLANAR = 0;
    static FRONT = 1;
    static BACK = 2;
    static SPANNING = 3;
    /**
     * @description: 
     * @param {Vector} normal
     * @param {number} w
     * @return {*}
     */
    constructor(normal, w) {
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

    splitPolygon(polygon, coplanarFront, coplanarBack, front, back,) {
        let polygonType = 0;
        const types = [];
        for (let i = 0; i < polygon.vertices.length; i++) {
            const t = this.normal.dot(polygon.vertices[i].position) - this.w;
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
                {
                    const f = [];
                    const b = [];
                    for (let i = 0; i < polygon.vertices.length; i++) {
                        const j = (i + 1) % polygon.vertices.length;
                        const [ti, tj] = [types[i], types[j]];
                        const [vi, vj] = [polygon.vertices[i], polygon.vertices[j]];
                        if (ti != Plane.BACK) f.push(vi);
                        if (ti != Plane.FRONT) b.push(ti != Plane.BACK ? vi.clone() : vi);

                        if ((ti | tj) == Plane.SPANNING) {
                            const t =
                                (this.w - this.normal.dot(vi.position)) /
                                this.normal.dot(tv0.copy(vj.position).sub(vi.position));
                            const v = vi.interpolate(vj, t);
                            f.push(v);
                            b.push(v.clone());
                        }
                    }
                    if (f.length >= 3) front.push(new Polygon(f, polygon.shared));
                    if (b.length >= 3) back.push(new Polygon(b, polygon.shared));
                }
                break;
            default:
                break;
        }
    }

    static EPSILON = 1e-5;

    /**
     * @description: 
     * @param {Vector} a
     * @param {Vector} b
     * @param {Vector} c
     * @return {Vector}
     */
    static fromPoints(a, b, c) {
        const n = tv0.copy(b).sub(a).cross(tv1.copy(c).sub(a)).normalize();
        return new Plane(n.clone(), n.dot(a));
    };
}


class Node {
    /**
     * @description: 
     * @param {Polygon[]} polygons
     * @return {*}
     */
    constructor(polygons) {
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

    clipPolygons(polygons) {
        if (!this.plane) return polygons.slice();
        let [front, back] = [[], []];
        for (let i = 0; i < polygons.length; i++) {
            this.plane.splitPolygon(polygons[i], front, back, front, back);
        }
        if (this.front) front = this.front.clipPolygons(front);
        if (this.back) back = this.back.clipPolygons(back);
        else back = [];

        return front.concat(back);
    }

    clipTo(bsp) {
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

    build(polygons) {
        if (!polygons.length) return;
        if (!this.plane) this.plane = polygons[0].plane.clone();
        const [front, back] = [[], []];
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

    static fromJSON = function (json) {
        return CSG.fromPolygons(
            json.polygons.map(
                (p) =>
                    new Polygon(
                        p.vertices.map((v) => new Vertex(v.position, v.normal, v.uv)),
                        p.shared,
                    ),
            ),
        );
    };
}

export {
    CSG, Vertex, Vector, Polygon, Plane
};
