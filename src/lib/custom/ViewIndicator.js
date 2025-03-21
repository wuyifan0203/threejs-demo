/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-03-20 13:41:04
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-21 18:45:32
 * @FilePath: \threejs-demo\src\lib\custom\ViewIndicator.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-03-20 13:41:04
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-21 16:13:07
 * @FilePath: \threejs-demo\src\lib\custom\ViewIndicator.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import {
    BufferGeometry,
    Vector3,
    BufferAttribute,
    CircleGeometry,
    Mesh,
    Object3D,
    MeshBasicMaterial,
    Group,
    ArrowHelper,
    Matrix4,
    Sprite,
    SpriteMaterial,
    CanvasTexture,
} from "three";
import {
    getRainbowColor,
    HALF_PI,
    Image_Path,
    initLoader,
    PI
} from "../tools/index.js";

const _v = /*PURE */ new Vector3();
const _n = /*PURE */ new Matrix4();
/** [posAxis, posValue, rotAxis rotValue][] */
const FACE_TRANSFORMATIONS = [
    0, -1, 1, -HALF_PI, 2, -HALF_PI,
    0, 1, 1, HALF_PI, 0, HALF_PI,
    1, 1, 2, PI, 0, -HALF_PI,
    1, -1, 0, 0, 0, HALF_PI,
    2, 1, 0, 0, 0, 0,
    2, -1, 1, -PI, 0, 0
];

const CORNER_POSITIONS = [
    1, 1, 1,
    -1, 1, 1,
    1, -1, 1,
    -1, -1, 1,
    1, 1, -1,
    -1, 1, -1,
    1, -1, -1,
    -1, -1, -1,
];

/** [direction[3], rotAxis1 ,rotValue2,rotAxis1 ,rotValue2 ][] */
const EDGE_TRANSFORMATIONS = [
    1, 1, 0, 2,
    1, -1, 0, 2,
    -1, 1, 0, 2,
    -1, -1, 0, 2,
    //
    1, 0, 1, 1,
    1, 0, -1, 1,
    -1, 0, 1, 1,
    -1, 0, -1, 1,
    //
    0, 1, 1, 0,
    0, 1, -1, 0,
    0, -1, 1, 0,
    0, -1, -1, 0,
];

const AXIS = [
    new Vector3(1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, 0, 1),
];
const AXIS_COLOR = [
    '#ff2c2c',
    '#4fff1e',
    '#00b4ff',
];
const COORD = ['x', 'y', 'z']

const connerFactor = 0.866; // Math.sqrt(3)/2
const edgeFactor = Math.SQRT2;

// params
const size = 2;
const halfSize = size / 2;
const faceSize = size * 0.7;
const faceRadius = 0.4;
const smoothness = 6;
const radius = faceSize * 0.18;
const connerOffset = 0.85;
const segments = 32;
const edgeWidth = size * 0.5;
const edgeHeight = size * 0.18;
const edgeOffset = 0.85;

class ViewIndicator extends Object3D {
    constructor() {
        super();

        this.indicator = new Group();
        // Face
        const faceGeometry = RectangleRounded(faceSize, faceSize, faceRadius, smoothness);

        for (let f = 0; f < 6; f++) {
            const [posAxis, posValue, rotAxis1, rotValue1, rotAxis2, rotValue2] = FACE_TRANSFORMATIONS.slice(f * 6, (f + 1) * 6);

            const material = new MeshBasicMaterial({ color: getRainbowColor(f), })
            const mesh = new Mesh(faceGeometry, material);

            mesh.rotation[COORD[rotAxis1]] = rotValue1;
            mesh.rotation[COORD[rotAxis2]] = rotValue2;
            mesh.position[COORD[posAxis]] = posValue * halfSize;

            this.indicator.add(mesh);
        }

        // Conner 
        const connerGeometry = new CircleGeometry(radius, segments);

        for (let j = 0; j < 8; j++) {
            const mesh = new Mesh(connerGeometry, new MeshBasicMaterial({ color: getRainbowColor(j), }));
            _v.fromArray(CORNER_POSITIONS, j * 3);
            mesh.position.copy(_v).multiplyScalar(halfSize * connerFactor * connerOffset);
            mesh.lookAt(_v.normalize().add(mesh.position));

            this.indicator.add(mesh);
        }

        // Edge
        const edgeGeometry = RectangleRounded(edgeWidth, edgeHeight, edgeHeight * 0.4, smoothness);
        const edgeGeometries = [
            edgeGeometry,
            edgeGeometry.clone().rotateZ(HALF_PI),
            edgeGeometry,
        ]
        for (let j = 0; j < 12; j++) {
            const [x, y, z, w] = EDGE_TRANSFORMATIONS.slice(j * 4, (j + 1) * 4);
            const mesh = new Mesh(edgeGeometries[w], new MeshBasicMaterial({ color: getRainbowColor(j), }));

            _v.set(x, y, z).normalize();
            mesh.position.copy(_v).multiplyScalar(halfSize * edgeFactor * edgeOffset);

            _n.lookAt(mesh.position, new Vector3(), mesh.up);
            mesh.quaternion.setFromRotationMatrix(_n);

            this.indicator.add(mesh);
        }

        this.coordinate = new Group();

        AXIS.forEach((axis, i) => {
            const arrow = new ArrowHelper(axis, new Vector3(-1, -1, -1), size * 1.2, AXIS_COLOR[i], 0.5, 0.2);
            console.log('arrow: ', arrow.position);
            const sprite = new Sprite(getSpriteMaterial(i));
            sprite.position.copy(axis).multiplyScalar(2.5).add(arrow.position);
            console.log('sprite.position: ', sprite.position);
            this.coordinate.add(sprite);
            this.coordinate.add(arrow);
        })

        this.add(this.indicator);
        this.add(this.coordinate);

        const loader = initLoader();
        const texture = loader.load(`../../${Image_Path}/others/uv_grid_opengl.jpg`)

        this.indicator.traverse((n) => {
            if (n.material) {
                n.material = new MeshBasicMaterial({ map: texture })
            }
        })
    }
}

function RectangleRounded(w, h, r, s) { // width, height, radius corner, smoothness
    s = Math.max(Math.floor(s), 1);
    // helper const's
    const wi = w / 2 - r;		// inner width
    const hi = h / 2 - r;		// inner height
    const ul = r / w;			// u left
    const ur = (w - r) / w;	// u right
    const vl = r / h;			// v low
    const vh = (h - r) / h;	// v high	

    const positions = [wi, hi, 0, -wi, hi, 0, -wi, -hi, 0, wi, -hi, 0];

    const uvs = [ur, vh, ul, vh, ul, vl, ur, vl];

    const n = [
        3 * (s + 1) + 3, 3 * (s + 1) + 4, s + 4, s + 5,
        2 * (s + 1) + 4, 2, 1, 2 * (s + 1) + 3,
        3, 4 * (s + 1) + 3, 4, 0
    ];

    const indices = [
        n[0], n[1], n[2], n[0], n[2], n[3],
        n[4], n[5], n[6], n[4], n[6], n[7],
        n[8], n[9], n[10], n[8], n[10], n[11]
    ];

    let phi, cos, sin, xc, yc, uc, vc, idx;

    for (let i = 0; i < 4; i++) {

        xc = i < 1 || i > 2 ? wi : -wi;
        yc = i < 2 ? hi : -hi;

        uc = i < 1 || i > 2 ? ur : ul;
        vc = i < 2 ? vh : vl;

        for (let j = 0, k = 0; j <= s; j++, k = j / s) {

            phi = HALF_PI * (i + k);
            cos = Math.cos(phi);
            sin = Math.sin(phi);

            positions.push(xc + r * cos, yc + r * sin, 0);
            uvs.push(uc + ul * cos, vc + vl * sin);

            if (j < s) {
                idx = (s + 1) * i + j + 4;
                indices.push(i, idx, idx + 1);
            }
        }
    }

    const geometry = new BufferGeometry();
    geometry.setIndex(new BufferAttribute(new Uint32Array(indices), 1));
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
    geometry.computeVertexNormals();

    return geometry;
}




function getSpriteMaterial(axis) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.fillStyle = AXIS_COLOR[axis];
    context.font = '48px Arial';
    context.fillText(COORD[axis], 20, 45);

    return new SpriteMaterial({ map: new CanvasTexture(canvas) })
}

export { ViewIndicator };