/*
 * @Date: 2024-01-31 10:26:52
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-04-12 17:30:19
 * @FilePath: \threejs-demo\src\lib\other\physijs\cannon-utils.js
 */
import {
    BoxGeometry,
    Group,
    Mesh,
    SphereGeometry,
    CylinderGeometry,
    BufferGeometry,
    Float32BufferAttribute,
    PlaneGeometry,
} from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import {
    Sphere,
    ConvexPolyhedron,
    Body,
    Cylinder,
    Quaternion,
    Shape,
    Vec3,
    Box as BoxShape
} from './cannon-es.js';

class CannonUtils {
    constructor(world, scene) {
        this.bodyMap = {};
        this.meshMap = {};
        this.map = {};
        this.world = world;
        this.scene = scene;
    }

    add(body, mesh) {
        this.bodyMap[body.id] = body;
        this.meshMap[mesh.uuid] = mesh;
        this.map[mesh.uuid] = body;
        this.scene.add(mesh);
        this.world.addBody(body);
    }

    update() {
        for (const key in this.meshMap) {
            const body = this.map[key];
            const mesh = this.meshMap[key];

            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        }
    }
    static body2Mesh(body, material) {
        const group = new Group();
        group.position.copy(body.position);
        group.quaternion.copy(body.quaternion);
        group.userData.body = body;

        const geometries = body.shapes.map((shape) => CannonUtils.shape2Geometry(shape));

        geometries.forEach((geometry, i) => {
            const mesh = new Mesh(geometry, material);
            mesh.castShadow = mesh.receiveShadow = true;
            mesh.position.copy(body.shapeOffsets[i])
            mesh.quaternion.copy(body.shapeOrientations[i])
            group.add(mesh);
        });

        return group;
    }

    static shape2Geometry(shape) {
        switch (shape.type) {
            case Shape.types.BOX:
                return new BoxGeometry(shape.halfExtents.x * 2, shape.halfExtents.y * 2, shape.halfExtents.z * 2);
            case Shape.types.SPHERE:
                return new SphereGeometry(shape.radius, 16, 16);
            case Shape.types.PARTICLE:
                return new SphereGeometry(0.1, 16, 16);
            case Shape.types.CYLINDER:
                return new CylinderGeometry(shape.radiusTop, shape.radiusBottom, shape.height, shape.numSegments);
            case Shape.types.TRIMESH:
                {
                    const geometry = new BufferGeometry();
                    geometry.setAttribute('position', new Float32BufferAttribute(shape.vertices, 3));
                    geometry.setIndex(shape.indices);
                    geometry.computeBoundingBox();
                    geometry.computeBoundingSphere();
                    geometry.computeVertexNormals();
                    return geometry;
                }
            case Shape.types.HEIGHTFIELD:
                {
                    const geometry = new BufferGeometry();
                    const s = shape.elementSize || 1; // assumes square heightfield, else i*x, j*y
                    const positions = shape.data.flatMap((row, i) => row.flatMap((z, j) => [i * s, j * s, z]));

                    const indices = [];

                    for (let xi = 0; xi < shape.data.length - 1; xi++) {
                        for (let yi = 0; yi < shape.data[xi].length - 1; yi++) {
                            const stride = shape.data[xi].length;
                            const index = xi * stride + yi;
                            indices.push(index + 1, index + stride, index + stride + 1);
                            indices.push(index + stride, index + 1, index);
                        }
                    }

                    geometry.setIndex(indices);
                    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
                    geometry.computeBoundingSphere();
                    geometry.computeVertexNormals();
                    return geometry;
                }
            case Shape.types.PLANE:
                return new PlaneGeometry(500, 500, 4, 4);
            case Shape.types.CONVEXPOLYHEDRON:
                {
                    const geometry = new BufferGeometry(); // Add vertices

                    const positions = [];

                    for (let i = 0; i < shape.vertices.length; i++) {
                        const vertex = shape.vertices[i];
                        positions.push(vertex.x, vertex.y, vertex.z);
                    }

                    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3)); // Add faces

                    const indices = [];

                    for (let i = 0; i < shape.faces.length; i++) {
                        const face = shape.faces[i];
                        const a = face[0];

                        for (let j = 1; j < face.length - 1; j++) {
                            const b = face[j];
                            const c = face[j + 1];
                            indices.push(a, b, c);
                        }
                    }

                    geometry.setIndex(indices);
                    geometry.computeBoundingSphere();
                    geometry.computeVertexNormals();
                    return geometry;
                }
            default:
                break;
        }

    }

    static mesh2Body(mesh) {
        const shapes = CannonUtils.geometry2Shape(mesh.geometry);

        const body = new Body({ mass: 1, });
        shapes.forEach(({ shape, offset, quaternion }) => {
            body.addShape(shape, offset, quaternion);
        });
        return body;
    }

    static geometry2Shape(geometry) {
        switch (geometry.type) {
            case 'TorusGeometry':
                {

                    const result = [];
                    const {
                        radialSegments,
                        radius,
                        tube,
                        tubularSegments,
                        arc
                    } = geometry.parameters;
                    const pice = arc / tubularSegments;
                    const halfPice = pice / 2;
                    const D = radius * Math.sin(halfPice);
                    const H = radius * Math.cos(halfPice)
                    const d = (D * (H - tube)) / H;

                    const columnShape = new Cylinder(tube, tube, d * 2, radialSegments);
                    for (let j = 0, k = halfPice; j < tubularSegments; j++, k = j * pice + halfPice) {
                        const offset = new Vec3(
                            H * Math.cos(k),
                            H * Math.sin(k),
                            0
                        );
                        const quaternion = new Quaternion().setFromEuler(0, 0, k, 'YXZ')
                        result.push({ shape: columnShape, offset, quaternion })

                    }
                    return result;
                }
            case 'BoxGeometry':
                {
                    const { width, height, depth } = geometry.parameters;
                    const shape = new BoxShape(new Vec3(
                        width / 2,
                        height / 2,
                        depth / 2
                    ))
                    return [{ shape, offset: new Vec3(0, 0, 0), quaternion: new Quaternion() }];
                }
            case 'SphereGeometry':
                {
                    const shape = new Sphere(geometry.parameters.radius)
                    return [{ shape, offset: new Vec3(0, 0, 0), quaternion: new Quaternion() }];
                }
            case 'CylinderGeometry':
                {
                    const { radiusTop, radiusBottom, height, radialSegments } = geometry.parameters;
                    const shape = new Cylinder(radiusTop, radiusBottom, height, radialSegments);
                    return [{ shape, offset: new Vec3(0, 0, 0), quaternion: new Quaternion() }];
                }
            default:
                {
                    let tempGeometry = new BufferGeometry();
                    tempGeometry.setAttribute("position", geometry.getAttribute("position"));

                    tempGeometry = mergeVertices(tempGeometry);

                    const position = tempGeometry.attributes.position.array;
                    const index = tempGeometry.index.array;

                    const points = [];
                    for (let i = 0; i < position.length; i += 3) {
                        points.push(new Vec3(position[i], position[i + 1], position[i + 2]));
                    }
                    const faces = [];
                    for (let i = 0; i < index.length; i += 3) {
                        faces.push([index[i], index[i + 1], index[i + 2]]);
                    }
                    const shape = new ConvexPolyhedron({ vertices: points, faces });
                    return [{ shape, offset: new Vec3(0, 0, 0), quaternion: new Quaternion() }];
                }
        }

    }
}
export { CannonUtils }