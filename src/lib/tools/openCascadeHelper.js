/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-04-29 09:56:12
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-05-22 18:00:17
 * @FilePath: \threejs-demo\src\lib\tools\openCascadeHelper.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import potpack from "../other/potpack.js";

class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    copy({ x, y, z }) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    distanceTo({ x, y, z }) {
        return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) + Math.pow(z - this.z, 2));
    }
}

const _v1 = new Vec3();
const _v2 = new Vec3();
class OpenCascadeHelper {
    constructor(occ) {
        this.occ = occ;
        this.typeEnum = {
            [occ.TopAbs_FACE]: occ.TopoDS.prototype.Face,
            [occ.TopAbs_EDGE]: occ.TopoDS.prototype.Edge,
            [occ.TopAbs_VERTEX]: occ.TopoDS.prototype.Vertex,
            [occ.TopAbs_SHELL]: occ.TopoDS.prototype.Shell,
            [occ.TopAbs_SOLID]: occ.TopoDS.prototype.Solid,
        };
    }

    static MAX_HASH = 100000000;

    #forEach(shape, callback, type) {
        let index = 0;
        const exporter = new this.occ.TopExp_Explorer(shape, type);
        exporter.Init(shape, type);
        while (exporter.More()) {
            callback(this.typeEnum[type](exporter.Current()), index++);
            exporter.Next();
        }
    }
    #tessellate(shape) {
        const faceList = [];
        new this.occ.BRepMesh_IncrementalMesh(shape, 0.1, false, 0.1, true);
        const ExpFace = new this.occ.TopExp_Explorer();
        for (ExpFace.Init(shape, this.occ.TopAbs_FACE, this.occ.TopAbs_SHAPE); ExpFace.More(); ExpFace.Next()) {
            const myFace = this.occ.TopoDS_Face(ExpFace.Current());
            const aLocation = new this.occ.TopLoc_Location();
            const myT = this.occ.BRep_Tool.prototype.Triangulation(myFace, aLocation);
            if (myT.IsNull()) {
                continue;
            }

            const this_face = {
                vertex_coord: [],
                normal_coord: [],
                tri_indexes: [],
                number_of_triangles: 0,
            };

            const pc = new this.occ.Poly_Connect(myT);
            const triangulation = myT.get();

            // write vertex buffer
            this_face.vertex_coord = new Array(triangulation.NbNodes() * 3);
            for (let i = 1; i <= triangulation.NbNodes(); i++) {
                const p = triangulation.Node(i).Transformed(aLocation.Transformation());
                this_face.vertex_coord[((i - 1) * 3) + 0] = p.X();
                this_face.vertex_coord[((i - 1) * 3) + 1] = p.Y();
                this_face.vertex_coord[((i - 1) * 3) + 2] = p.Z();
            }

            // write normal buffer
            const myNormal = new this.occ.TColgp_Array1OfDir(1, triangulation.NbNodes());
            this.occ.StdPrs_ToolTriangulatedShape.Normal(myFace, pc, myNormal);
            this_face.normal_coord = new Array(myNormal.Length() * 3);
            for (let i = myNormal.Lower(); i <= myNormal.Upper(); i++) {
                const d = myNormal.Value(i).Transformed(aLocation.Transformation());
                this_face.normal_coord[((i - 1) * 3) + 0] = d.X();
                this_face.normal_coord[((i - 1) * 3) + 1] = d.Y();
                this_face.normal_coord[((i - 1) * 3) + 2] = d.Z();
            }

            // write triangle buffer
            const orient = myFace.Orientation_1();
            const triangles = myT.get().Triangles();
            this_face.tri_indexes = new Array(triangles.Length() * 3);
            let validFaceTriCount = 0;
            for (let nt = 1; nt <= myT.get().NbTriangles(); nt++) {
                const t = triangles.Value(nt);
                let n1 = t.Value(1);
                let n2 = t.Value(2);
                let n3 = t.Value(3);
                if (orient !== this.occ.TopAbs_Orientation.TopAbs_FORWARD) {
                    let tmp = n1;
                    n1 = n2;
                    n2 = tmp;
                }
                const count = validFaceTriCount * 3;
                this_face.tri_indexes[count + 0] = n1;
                this_face.tri_indexes[count + 1] = n2;
                this_face.tri_indexes[count + 2] = n3;
                validFaceTriCount++;
            }
            this_face.number_of_triangles = validFaceTriCount;
            faceList.push(this_face);
        }
        return faceList;
    }
    #joinPrimitives(faceList) {
        let [obP, obN, obTR, advance] = [0, 0, 0, 0]
        const vertexCoord = [];
        const normalCoord = [];
        const indices = [];

        let [v, i] = [0, 0];

        faceList.forEach(face => {
            for (let x = 0, l = face.vertex_coord.length / 3; x < l; x++) {
                v = obP * 3;
                i = x * 3;
                vertexCoord[v + 0] = face.vertex_coord[i + 0];
                vertexCoord[v + 1] = face.vertex_coord[i + 1];
                vertexCoord[v + 2] = face.vertex_coord[i + 2];
                obP++;
            }
            for (let x = 0, l = face.normal_coord.length / 3; x < l; x++) {
                v = obN * 3;
                i = x * 3;
                normalCoord[v + 0] = face.normal_coord[i + 0];
                normalCoord[v + 1] = face.normal_coord[i + 1];
                normalCoord[v + 2] = face.normal_coord[i + 2];
                obN++;
            }
            for (let x = 0, l = face.tri_indexes.length / 3; x < l; x++) {
                v = obTR * 3;
                i = x * 3;
                indices[v + 0] = face.tri_indexes[i + 0] + advance - 1;
                indices[v + 1] = face.tri_indexes[i + 1] + advance - 1;
                indices[v + 2] = face.tri_indexes[i + 2] + advance - 1;
                obTR++;
            }

            advance = obP;
        });
        return [vertexCoord, normalCoord, indices];
    }
    #generateBuffer(triangleCount, vertexCoord, normalCoord, indices) {

        const position = new Float32Array(triangleCount * 9);
        const normal = new Float32Array(triangleCount * 9);

        let bufferIndex = 0;
        for (let i = 0; i < triangleCount; i++) {
            const { vertices, normals } = this.#getTriangle(i, indices);
            for (let j = 0; j < 3; j++) {
                bufferIndex = i * 9 + j * 3;
                position[bufferIndex + 0] = vertexCoord[vertices[j] + 0];
                position[bufferIndex + 1] = vertexCoord[vertices[j] + 1];
                position[bufferIndex + 2] = vertexCoord[vertices[j] + 2];

                normal[bufferIndex + 0] = normalCoord[normals[j] + 0];
                normal[bufferIndex + 1] = normalCoord[normals[j] + 1];
                normal[bufferIndex + 2] = normalCoord[normals[j] + 2];
            }
        }

        return { position, normal }
    }
    #getTriangle(triangleIndex, indices) {
        const pA = indices[(triangleIndex * 3) + 0] * 3;
        const pB = indices[(triangleIndex * 3) + 1] * 3;
        const pC = indices[(triangleIndex * 3) + 2] * 3;

        const vertices = [pA, pB, pC];
        const normals = [pA, pB, pC];
        const texcoords = [pA, pB, pC];
        return { vertices, normals, texcoords };
    }

    convertBuffer(shape) {
        const faceList = this.#tessellate(shape);
        const [vertexCoord, normalCoord, indices] = this.#joinPrimitives(faceList);
        const triangleCount = faceList.reduce((a, b) => a + b.number_of_triangles, 0);
        return this.#generateBuffer(triangleCount, vertexCoord, normalCoord, indices);
    }

    convertBuffer2(shapes, lineDeviation = 0.1, angleDeviation = 0.5) {
        shapes = Array.isArray(shapes) ? shapes : [shapes];
        const compound = new this.occ.TopoDS_Compound();
        const builder = new this.occ.BRep_Builder();
        builder.MakeCompound(compound);

        const totalEdgeHashes = {};
        const totalFaceHashes = {};
        shapes.forEach((shape) => {
            Object.assign(totalEdgeHashes, this.forEachEdge(shape, () => { }));
            this.forEachFace(shape, (face, index) => {
                totalFaceHashes[face.HashCode(OpenCascadeHelper.MAX_HASH)] = index;
            });
            builder.Add(compound, shape);
        });


        const faceList = [];
        const edgeList = [];

        let currentFace = 0;
        try {
            const shape = new this.occ.TopoDS_Shape(compound);
            new this.occ.BRepMesh_IncrementalMesh(shape, lineDeviation, false, angleDeviation);

            const totalEdgeHashes2 = {};
            const triangulations = [];
            const uvBoxes = [];

            this.forEachFace(shape, (face) => {
                const location = new this.occ.TopLoc_Location();
                const handelTriangulation = this.occ.BRep_Tool.prototype.Triangulation(face, location);
                if (handelTriangulation.IsNull()) {
                    console.error('Encountered Null Face!');
                    return;
                }
                const faceInfo = createFaceInfo(totalFaceHashes[face.HashCode(OpenCascadeHelper.MAX_HASH)]);

                const pc = new this.occ.Poly_Connect(handelTriangulation);
                const triangulation = handelTriangulation.get();
                const nodes = triangulation.Nodes();

                // vertex buffer
                faceInfo.vertex = new Array(nodes.Length() * 3);
                for (let i = 0, l = nodes.Length(), j = i; i < l; i++, j = i * 3) {
                    const point = nodes.Value(i + 1).Transformed(location.Transformation());
                    faceInfo.vertex[j + 0] = point.X();
                    faceInfo.vertex[j + 1] = point.Y();
                    faceInfo.vertex[j + 2] = point.Z();
                }

                // uv buffer
                const orientation = face.Orientation();
                if (triangulation.HasUVNodes()) {
                    let [uMax, uMin, vMax, vMin] = [0, 0, 0, 0];

                    const uvNodes = triangulation.UVNodes();
                    const uvNodesLength = uvNodes.Length();

                    faceInfo.uv = new Array(uvNodesLength * 2);
                    for (let i = 0, j = i; i < uvNodesLength; i++, j = i * 2) {
                        const point = uvNodes.Value(i + 1);
                        const x = point.X(), y = point.Y();
                        faceInfo.uv[j + 0] = x;
                        faceInfo.uv[j + 1] = y;

                        // compute uv bounds
                        if (i === 0) { [uMax, uMin, vMax, vMin] = [x, x, y, y]; }
                        if (x < uMin) { uMin = x; } else if (x > uMax) { uMax = x; }
                        if (y < vMin) { vMin = y; } else if (y > vMax) { vMax = y; }
                    }

                    const surface = this.occ.BRep_Tool.prototype.Surface(face).get();
                    // min + (max -min) * 0.5 => (min + max) * 0.5
                    const handleUIsoCurve = surface.UIso((uMax + uMin) * 0.5);
                    const handleVIsoCurve = surface.VIso((vMax + vMin) * 0.5);
                    const uAdaptor = new this.occ.GeomAdaptor_Curve(handleVIsoCurve);
                    const vAdaptor = new this.occ.GeomAdaptor_Curve(handleUIsoCurve);
                    uvBoxes.push({
                        w: this.lengthOfCurve(uAdaptor, uMin, uMax),
                        h: this.lengthOfCurve(vAdaptor, vMin, vMax),
                        index: currentFace
                    });

                    //
                    for (let i = 0, j = i; i < uvNodesLength; i++, j = i * 2) {
                        _v1.x = faceInfo.uv[j + 0];
                        _v1.y = faceInfo.uv[j + 1];

                        _v1.x = (_v1.x - uMin) / (uMax - uMin);
                        _v1.y = (_v1.y - vMin) / (vMax - vMin);

                        if (orientation !== this.occ.TopAbs_FORWARD) {
                            _v1.x = 1 - _v1.y;
                        }

                        faceInfo.uv[j + 0] = _v1.x;
                        faceInfo.uv[j + 1] = _v1.y;
                    }
                }

                // normal buffer
                const normal = new this.occ.TColgp_Array1OfDir(nodes.Lower(), nodes.Upper());
                const sts = new this.occ.StdPrs_ToolTriangulatedShape();
                sts.Normal(face, pc, normal);
                faceInfo.normal = new Array(normal.Length() * 3);
                for (let i = 0, l = normal.Length(), j = i; i < l; i++, j = i * 3) {
                    const point = normal.Value(i + 1).Transformed(location.Transformation());
                    faceInfo.normal[j + 0] = point.X();
                    faceInfo.normal[j + 1] = point.Y();
                    faceInfo.normal[j + 2] = point.Z();
                }

                // triangle buffer
                const triangles = triangulation.Triangles();
                faceInfo.index = new Array(triangles.Length() * 3);
                let validFaceTriCount = 0;
                for (let t = 1; t <= triangulation.NbTriangles(); t++) {
                    const triangle = triangles.Value(t);
                    let n1 = triangle.Value(1);
                    let n2 = triangle.Value(2);
                    let n3 = triangle.Value(3);
                    if (orientation !== this.occ.TopAbs_FORWARD) {
                        const tmp = n1;
                        n1 = n2;
                        n2 = tmp;
                    }

                    let j = validFaceTriCount * 3;
                    faceInfo.index[j + 0] = n1 - 1;
                    faceInfo.index[j + 1] = n2 - 1;
                    faceInfo.index[j + 2] = n3 - 1;
                    validFaceTriCount++;
                }

                faceInfo.triangleCount = validFaceTriCount;
                faceList.push(faceInfo);
                currentFace += 1;

                this.forEachEdge(face, (edge) => {
                    const edgeHash = edge.HashCode(OpenCascadeHelper.MAX_HASH);
                    if (totalEdgeHashes2.hasOwnProperty(edgeHash)) {
                        const edgeInfo = createEdgeInfo();

                        const handlePolygonTra = this.occ.BRep_Tool.prototype.PolygonOnTriangulation(edge, handelTriangulation, location);
                        const edgeNodes = handlePolygonTra.get().Nodes();

                        // vertex buffer
                        edgeInfo.vertex = new Array(edgeNodes.Length() * 3);
                        for (let i = 0, l = edgeNodes.Length(), j = i; i < l; i++, j = i * 3) {
                            const vertexIndex = (edgeNodes.Value(i + 1) - 1) * 3;
                            edgeInfo.vertex[j + 0] = faceInfo.vertex[vertexIndex + 0];
                            edgeInfo.vertex[j + 1] = faceInfo.vertex[vertexIndex + 1];
                            edgeInfo.vertex[j + 2] = faceInfo.vertex[vertexIndex + 2];
                        }

                        edgeInfo.index = totalEdgeHashes[edgeHash];

                        edgeList.push(edgeInfo);
                    } else {
                        totalEdgeHashes2[edgeHash] = edgeHash;
                    }
                })
                triangulations.push(handelTriangulation);
            });

            const padding = 2;
            for (let i = 0, l = uvBoxes.length; i < l; i++) {
                uvBoxes[i].w += padding;
                uvBoxes[i].h += padding;
            }
            const packing = potpack(uvBoxes);

            for (let i = 0; i < uvBoxes.length; i++) {
                const box = uvBoxes[i];
                const faceInfo = faceList[box.index];

                for (let j = 0, k = 0, l = faceInfo.uv.length / 2; j < l; j++, k = j * 2) {
                    _v1.x = faceInfo.uv[k + 0];
                    _v1.y = faceInfo.uv[k + 1];

                    _v1.x = (_v1.x * (box.w - padding) + (box.x + padding / 2)) / Math.max(packing.w, packing.h);
                    _v1.y = (_v1.y * (box.h - padding) + (box.y + padding / 2)) / Math.max(packing.w, packing.h);

                    faceInfo.uv[k + 0] = _v1.x;
                    faceInfo.uv[k + 1] = _v1.y
                }
            }

            for (let index = 0; index < triangulations.length; index++) triangulations[index].Nullify();

            this.forEachEdge(shape, (edge) => {
                const edgeHash = edge.HashCode(OpenCascadeHelper.MAX_HASH);
                if (!totalEdgeHashes2.hasOwnProperty(edgeHash)) {
                    const edgeInfo = createEdgeInfo();

                    const location = new this.occ.TopLoc_Location();
                    const adaptorCurve = new this.occ.BPepAdaptor_Curve(edge);
                    const deflection = new this.occ.GCPnts_TangentialDeflection(adaptorCurve, lineDeviation, 0.1);

                    edgeInfo.vertex = new Array(deflection.NbPoints() * 3);
                    for (let i = 0, l = deflection.NbPoints(), j = 0; i < l; i++, j = i * 3) {
                        const point = deflection.Value(i + 1).Transformed(location.Transformation());
                        edgeInfo.vertex[j + 0] = point.X();
                        edgeInfo.vertex[j + 1] = point.Y();
                        edgeInfo.vertex[j + 2] = point.Z();
                    }

                    edgeInfo.index = totalEdgeHashes[edgeHash];
                    totalEdgeHashes2[edgeHash] = edgeHash;

                    edgeList.push(edgeInfo);
                }
            })
        } catch (error) {
            console.error(error);
        }

        return {
            faceList,
            edgeList
        }
    }

    lengthOfCurve(geomAdaptor, min, max, segment = 5) {
        const gpPnt = new this.occ.gp_Pnt();
        let length = 0;
        for (let i = min; i <= max; i += (max - min) / segment) {
            geomAdaptor.D0(i, gpPnt);
            _v1.set(gpPnt.X(), gpPnt.Y(), gpPnt.Z());
            if (i !== min) {
                length += _v1.distanceTo(_v2);
            }
            _v2.copy(_v1);
        }
        return length;
    }

    forEachFace(shape, callback) {
        this.#forEach(shape, callback, this.occ.TopAbs_FACE);
    }

    forEachWire(shape, callback) {
        this.#forEach(shape, callback, this.occ.TopAbs_WIRE);
    }

    forEachShell(shape, callback) {
        this.#forEach(shape, callback, this.occ.TopAbs_SHELL);
    }

    forEachVertex(shape, callback) {
        this.#forEach(shape, callback, this.occ.TopAbs_VERTEX);
    }
    forEachEdge(shape, callback) {
        const hashes = {};
        let index = 0;
        this.#forEach(shape, (edge) => {
            const hash = edge.HashCode(OpenCascadeHelper.MAX_HASH);
            if (!hashes.hasOwnProperty(hash)) {
                hashes[hash] = index;
                callback(edge, index++);
            }
        }, this.occ.TopAbs_EDGE);
        return hashes;
    }
}

function createFaceInfo(faceIndex) {
    return {
        vertex: [],
        uv: [],
        normal: [],
        index: [],
        triangleCount: 0,
        faceIndex
    }
}

function createEdgeInfo() {
    return {
        vertex: [],
        index: -1
    }
}

export { OpenCascadeHelper } 