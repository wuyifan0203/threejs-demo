/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-03-20 13:41:04
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-25 19:24:03
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
    Vector2,
    Vector4,
    OrthographicCamera,
    Raycaster,
    Quaternion,
} from "three";
import {
    HALF_PI,
    PI,
    ZERO3,
} from "../tools/index.js";

const _v = /*PURE */ new Vector3();
const _n = /*PURE */ new Matrix4();
const targetQuaternion = /*PURE */ new Quaternion();
const currentQuaternion = /*PURE */ new Quaternion();
const _p = /*PURE */ new Quaternion();
const _m = /*PURE */ new Vector2();

const rotationMap = {
    // left ??
    0: {
        target: new Vector3(1, 0, 0),
        up: new Vector3(0, 0, 1),
    },
    // right ??
    1: {
        target: new Vector3(-1, 0, 0),
        up: new Vector3(0, 0, 1),
    },
    // back
    2: {
        target: new Vector3(0, -1, 0),
        up: new Vector3(0, 0, 1),
    },
    // front
    3: {
        target: new Vector3(0, 1, 0),
        up: new Vector3(0, 0, 1),
    },
    // top
    4: {
        target: new Vector3(0, 0, -1),
        up: new Vector3(0, 1, 0),
    },
    // bottom
    5: {
        target: new Vector3(0, 0, 1),
        up: new Vector3(0, 1, 0),
    },
    6: new Matrix4(),
    7: new Matrix4(),
    8: new Matrix4(),
    9: new Matrix4(),
    10: new Matrix4(),
    11: new Matrix4(),
    12: new Matrix4(),
    13: new Matrix4(),
    // back-right
    14: {
        target: new Vector3(-1, -1, 0),
        up: new Vector3(0, 0, 1),
    },
    // front-right
    15: {
        target: new Vector3(-1, 1, 0),
        up: new Vector3(0, 0, 1),
    },
    // back-left
    16: {
        target: new Vector3(1, -1, 0),
        up: new Vector3(0, 0, 1),
    },
    // front-left
    17: {
        target: new Vector3(1, 1, 0),
        up: new Vector3(0, 0, 1),
    },
    18: new Matrix4(),
    19: new Matrix4(),
    20: {
        target: new Vector3(1, 0, 1),
        up: new Vector3(0, 0, 1),
    },
    21: {
        target: new Vector3(1, 0, 1),
        up: new Vector3(0, 0, 1),
    },
    22: new Matrix4(),
    23: new Matrix4(),
    // front-top
    24: {
        target: new Vector3(0, 1, -1),
        up: new Vector3(0, 0, 1),
    },
    // front-bottom
    25: {
        target: new Vector3(0, 1, 1),
        up: new Vector3(0, 0, 1),
    },
    26: new Matrix4(),
}

const _orthoCamera = new OrthographicCamera(- 2, 2, 2, - 2, 0, 6);
_orthoCamera.updateProjectionMatrix();
_orthoCamera.position.set(0, 0, 3);

const _viewport = new Vector4();
const _r = new Raycaster();
let _radius = 0;
const _dummy = new Object3D();
const _mouse = new Vector2();
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
]

const COORD = ['x', 'y', 'z'];

const connerFactor = 0.866; // Math.sqrt(3)/2
const edgeFactor = Math.SQRT2;


// params
const size = 2;
const halfSize = size / 2;
const faceSize = size * 0.65;
const faceRadius = 0.4;
const faceSmoothness = 6;
const faceTextColor = '#000000';
const faceTextSize = 28;
const connerRadius = faceSize * 0.18;
const connerOffset = 0.75;
const connerSegments = 32;
const edgeWidth = size * 0.5;
const edgeHeight = size * 0.18;
const edgeOffset = 0.85;
const axisTextSize = 48;
const axisColor = [
    '#ff4466',
    '#88ff44',
    '#4488ff',
];
const faceText = ['LEFT', 'TOP', 'RIGHT', 'BOTTOM', 'FRONT', 'BACK'];
const backgroundColor = '#ffffff';
const hoverColor = '#000055';


const defaultParams = {
    faceText,
    faceTextColor,
    faceTextSize,
    axisColor,
    axisTextSize,
    size,
    faceSize,
    faceRadius,
    faceSmoothness,
    connerRadius,
    connerOffset,
    connerSegments,
    edgeWidth,
    edgeHeight,
    edgeOffset,
    backgroundColor,
    hoverColor,
    renderOffset: new Vector2(1, 1),
    renderSize: 128,
}
class ViewIndicator extends Object3D {
    constructor(camera, domElement, params = defaultParams) {

        super();
        this.parameters = Object.assign({}, defaultParams, params,);
        this._camera = camera;
        this._domElement = domElement;

        this.center = new Vector3();

        this.indicator = new Group();
        this.indicator.faces = [];
        this.indicator.conners = [];
        this.indicator.edges = [];

        this.rotateSpeed = HALF_PI;

        // 判断是否在运动
        this.animating = false;

        // Face
        const { faceSize, faceRadius, faceSmoothness, faceText, faceTextColor, faceTextSize, backgroundColor } = this.parameters;

        const faceGeometry = RectangleRounded(faceSize, faceSize, faceRadius, faceSmoothness);

        const faceMaterials = createFaceMaterials({ faceText, faceTextColor, faceTextSize, backgroundColor });

        for (let f = 0; f < 6; f++) {
            const [posAxis, posValue, rotAxis1, rotValue1, rotAxis2, rotValue2] = FACE_TRANSFORMATIONS.slice(f * 6, (f + 1) * 6);

            const mesh = new Mesh(faceGeometry, faceMaterials[f]);
            mesh.name = 'FACE_' + faceText[f];
            mesh.userData.index = f;
            mesh.rotation[COORD[rotAxis1]] = rotValue1;
            mesh.rotation[COORD[rotAxis2]] = rotValue2;
            mesh.position[COORD[posAxis]] = posValue * halfSize;
            mesh.direction = new Vector3().copy(mesh.position).normalize();

            this.indicator.add(mesh);
            this.indicator.faces.push(mesh);
        }

        // Conner 
        const { connerRadius, connerSegments, connerOffset } = this.parameters;

        const connerGeometry = new CircleGeometry(connerRadius, connerSegments);

        for (let j = 0; j < 8; j++) {
            const mesh = new Mesh(connerGeometry, new MeshBasicMaterial({ color: backgroundColor, }));
            mesh.name = 'CONNER_' + j;
            mesh.userData.index = 6 + j;
            _v.fromArray(CORNER_POSITIONS, j * 3).normalize();
            mesh.position.copy(_v).multiplyScalar(halfSize * connerFactor * connerOffset * 2);
            mesh.direction = new Vector3().copy(_v);
            mesh.lookAt(_v.add(mesh.position));

            this.indicator.add(mesh);
            this.indicator.conners.push(mesh);
        }

        // Edge
        const { edgeWidth, edgeHeight, edgeOffset } = this.parameters;
        const edgeGeometry = RectangleRounded(edgeWidth, edgeHeight, edgeHeight * 0.4, faceSmoothness);
        const edgeGeometries = [
            edgeGeometry,
            edgeGeometry.clone().rotateZ(HALF_PI),
            edgeGeometry,
        ]
        for (let j = 0; j < 12; j++) {
            const [x, y, z, w] = EDGE_TRANSFORMATIONS.slice(j * 4, (j + 1) * 4);
            const mesh = new Mesh(edgeGeometries[w], new MeshBasicMaterial({ color: backgroundColor, }));
            mesh.name = 'EDGE_' + j;
            mesh.userData.index = 14 + j;

            _v.set(x, y, z).normalize();
            mesh.position.copy(_v).multiplyScalar(halfSize * edgeFactor * edgeOffset);
            mesh.direction = new Vector3().copy(_v);
            _n.lookAt(mesh.position, ZERO3, mesh.up);
            mesh.quaternion.setFromRotationMatrix(_n);

            this.indicator.add(mesh);
            this.indicator.edges.push(mesh);
        }

        const { axisColor, axisTextSize } = this.parameters;
        this.coordinate = new Group();
        const spriteMaterials = createSpriteMaterials({ axisColor, axisTextSize });
        this.coordinate.sprites = [];
        this.coordinate.arrows = [];

        AXIS.forEach((axis, i) => {
            const arrow = new ArrowHelper(axis, new Vector3(-1, -1, -1), size * 1.2, axisColor[i], 0.5, 0.2);
            const sprite = new Sprite(spriteMaterials[i]);
            sprite.position.copy(axis).multiplyScalar(2.5).add(arrow.position);
            this.coordinate.add(sprite);
            this.coordinate.add(arrow);
            this.coordinate.sprites.push(sprite);
            this.coordinate.arrows.push(arrow);
        });

        this.add(this.indicator);
        this.add(this.coordinate);
    }

    render(renderer) {
        const { renderSize, renderOffset } = this.parameters;

        this.quaternion.copy(this._camera.quaternion).invert();
        this.updateMatrixWorld();

        _v.set(0, 0, 1);
        _v.applyQuaternion(this._camera.quaternion);
        currentQuaternion.copy(this._camera.quaternion);

        _m.x = (this._domElement.offsetWidth - renderSize) * renderOffset.x;
        _m.y = (this._domElement.offsetHeight - renderSize) * (1 - renderOffset.y);

        renderer.clearDepth();

        renderer.getViewport(_viewport);
        renderer.setViewport(_m.x, _m.y, renderSize, renderSize);

        renderer.render(this, _orthoCamera);

        renderer.setViewport(_viewport.x, _viewport.y, _viewport.z, _viewport.w);
    }

    handleClick(event) {
        if (this.animating) return;

        this.indicator.children.forEach((child) => {
            child.material.color.set(backgroundColor);
        });
        if (!this.containCursor(event)) return;

        _r.setFromCamera(_mouse, _orthoCamera);
        const intersects = _r.intersectObjects(this.indicator.children);
        if (intersects.length) {
            const object = intersects[0].object;
            object.material.color.set(this.parameters.hoverColor);
            this._prepareAnimate(object);
            this.animating = true;
        } else {
            this.animating = false;
        }
    }

    handleMove(event) {

        this.indicator.children.forEach((child) => {
            child.material.color.set(backgroundColor);
        });
        if (!this.containCursor(event)) return;

        _r.setFromCamera(_mouse, _orthoCamera);
        const intersects = _r.intersectObjects(this.indicator.children);
        if (intersects.length) {
            const object = intersects[0].object;
            object.material.color.set(this.parameters.hoverColor);
        }
    }

    containCursor({ clientX, clientY }) {
        const { renderSize, renderOffset } = this.parameters;
        const { offsetHeight, offsetWidth } = this._domElement;

        const left = offsetWidth * renderOffset.x - renderSize;
        const top = offsetHeight * renderOffset.y - renderSize;
        const right = left + renderSize;
        const bottom = top + renderSize;

        const result = left <= clientX && clientX <= right && top <= clientY && clientY <= bottom;
        if (result) {
            _mouse.x = (clientX - left) / renderSize * 2 - 1;
            _mouse.y = - (clientY - top) / renderSize * 2 + 1;
        }

        return result;
    }

    _prepareAnimate(object) {
        _radius = this._camera.position.distanceTo(this.center);
        _v.copy(object.direction).multiplyScalar(_radius).add(this.center);

        const { target, up } = rotationMap[object.userData.index];
        console.log('object.userData.index: ', object.userData.index);
        targetQuaternion.setFromRotationMatrix(_n.lookAt(ZERO3, target, up));
        this._camera.up.copy(up);
    }

    update(deltaTime) {
        const step = deltaTime * this.rotateSpeed;

        currentQuaternion.rotateTowards(targetQuaternion, step);
        this._camera.quaternion.copy(currentQuaternion);
        this._camera.position.set(0, 0, 1).applyQuaternion(currentQuaternion).multiplyScalar(_radius).add(this.center);

        this.animating = currentQuaternion.angleTo(targetQuaternion) !== 0;
    }

    dispose() {
        this.coordinate.sprites.forEach((sprite) => {
            sprite.material.dispose();
            sprite.material.map.dispose();
            sprite.removeFromParent();
        });

        this.coordinate.arrows.forEach((arrow) => {
            arrow.removeFromParent();
            arrow.dispose();
        });

        this.indicator.faces.forEach((face) => {
            face.geometry.dispose();
            face.material.dispose();
            face.material.map.dispose();
            face.removeFromParent();
        });
        this.indicator.conners.forEach((conner) => {
            conner.geometry.dispose();
            conner.material.dispose();
            conner.removeFromParent();
        });
        this.indicator.edges.forEach((edge) => {
            edge.geometry.dispose();
            edge.material.dispose();
            edge.removeFromParent();
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


function createFaceMaterials({ faceText, faceTextColor, faceTextSize, backgroundColor }) {
    const dpi = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    const resolution = 128;
    canvas.width = resolution * dpi * 6;
    canvas.height = resolution * dpi;

    const context = canvas.getContext('2d');
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = `bold ${faceTextSize * dpi}px Arial`;
    context.fillStyle = faceTextColor;
    context.textBaseline = "middle";

    faceText.forEach((text, i) => {
        const textWidth = context.measureText(text).width / dpi;
        const offsetX = resolution * i + (resolution - textWidth) / 2;
        context.fillText(faceText[i], offsetX * dpi, resolution / 2 * dpi);
    });

    const pice = 1 / (6 * dpi);

    return faceText.map((text, i) => {
        const texture = new CanvasTexture(canvas);
        texture.repeat.set(pice, 1);
        texture.offset.set(i * pice, 0);

        const material = new MeshBasicMaterial({
            color: backgroundColor,
            map: texture,
            transparent: true,
        });

        material.name = text;

        return material;
    })
}

function createSpriteMaterials({ axisColor, axisTextSize }) {
    const dpi = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.width = 64 * dpi * 3;
    canvas.height = 64 * dpi;
    const context = canvas.getContext('2d');
    context.font = `${axisTextSize * dpi}px Arial bold`;
    COORD.forEach((_, i) => {
        context.fillStyle = axisColor[i];
        context.fillText(COORD[i], (64 * i + 20) * dpi, 45 * dpi);
    });

    const pice = 1 / (3 * dpi);

    return COORD.map((key, i) => {
        const texture = new CanvasTexture(canvas);
        texture.repeat.set(pice, 1);
        texture.offset.set(i * pice, 0);

        const material = new SpriteMaterial({
            map: texture,
            transparent: true,
        })
        material.name = key;
        return material;
    })
}

export { ViewIndicator, rotationMap };