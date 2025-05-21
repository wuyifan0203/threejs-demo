/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-04-29 09:56:12
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-05-21 15:12:04
 * @FilePath: \threejs-demo\src\lib\tools\openCascadeHelper.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */

const _v1 = new Vec3();
const _v2 = new Vec3();
class OpenCascadeHelper {
    constructor(occ) {
        this.occ = occ;
        this.typeEnum = {
            [occ.TopAbs_ShapeEnum.TopAbs_FACE]: occ.TopoDS.Face,
            [occ.TopAbs_ShapeEnum.TopAbs_EDGE]: occ.TopoDS.Edge,
            [occ.TopAbs_ShapeEnum.TopAbs_VERTEX]: occ.TopoDS.Vertex,
            [occ.TopAbs_ShapeEnum.TopAbs_SHELL]: occ.TopoDS.Shell,
            [occ.TopAbs_ShapeEnum.TopAbs_SOLID]: occ.TopoDS.Solid,
        };
    }

    static MAX_HASH = 1000000;

    #forEach(shape, callback, type) {
        let index = 0;
        const exporter = new occ.TopExp_Explorer(shape, type);
        exporter.Init(shape, type);
        while (exporter.More()) {
            callback(this.typeEnum[type](exporter.Current()), index++);
            exporter.Next();
        }
    }
    #tessellate(shape) {
        const faceList = [];
        new occ.BRepMesh_IncrementalMesh_2(shape, 0.1, false, 0.1, true);
        const ExpFace = new occ.TopExp_Explorer_1();
        for (ExpFace.Init(shape, occ.TopAbs_ShapeEnum.TopAbs_FACE, occ.TopAbs_ShapeEnum.TopAbs_SHAPE); ExpFace.More(); ExpFace.Next()) {
            const myFace = occ.TopoDS.Face_1(ExpFace.Current());
            const aLocation = new occ.TopLoc_Location_1();
            const myT = occ.BRep_Tool.Triangulation(myFace, aLocation, 0 /* == Poly_MeshPurpose_NONE */);
            if (myT.IsNull()) {
                continue;
            }

            const this_face = {
                vertex_coord: [],
                normal_coord: [],
                tri_indexes: [],
                number_of_triangles: 0,
            };

            const pc = new occ.Poly_Connect_2(myT);
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
            const myNormal = new occ.TColgp_Array1OfDir_2(1, triangulation.NbNodes());
            occ.StdPrs_ToolTriangulatedShape.Normal(myFace, pc, myNormal);
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
                if (orient !== occ.TopAbs_Orientation.TopAbs_FORWARD) {
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
        console.log('triangleCount, vertexCoord, normalCoord, indices: ', triangleCount, vertexCoord, normalCoord, indices);

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
        const compound = new this.occ.TopoDs_Compound();
        const builder = new this.occ.BPep_Builder();
        builder.MakeCompound(compound);

        const totalEdgeHashes = {};
        const totalFaceHashes = {};
        shapes.forEach((shape) => {
            Object.assign(totalEdgeHashes, this.forEachEdge(shape, () => { }));
            this.forEachFace(shape, (face, index) => {
                totalFaceHashes[face.HashCode(this.MAX_HASH)] = index;
            });
            builder.Add(compound, shape);
        });

        const faceList = [];
        const edgeList = [];

        let currentFace = 0;
        try {
            const shape = new this.occ.TopoDS_Shape();
            new this.occ.BRepMesh_IncrementalMesh(shape, lineDeviation, false, angleDeviation);

            const totalEdgeHashes2 = {};
            const triangulations = [];
            const uvs = [];

            this.forEachFace(shape, (face) => {
                const location = this.occ.TopLoc_Location();
                const handelTriangulation = this.occ.BRep_Tool.Triangulation(face, location);
                if (handelTriangulation.IsNull()) {
                    console.error('Encountered Null Face!');
                    return;
                }

                const faceInfo = createFaceInfo(totalEdgeHashes[face.HashCode(this.MAX_HASH)]);

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

                    const surface = this.occ.BRep_Tool.Surface(face).get();
                    // min + (max -min) * 0.5 => (min + max) * 0.5
                    const handleUIsoCurve = surface.UIso((uMax + uMin) * 0.5);
                    const handleVIsoCurve = surface.VIso((vMax + vMin) * 0.5);
                    const uAdaptor = new this.occ.GeomAdaptor_Curve(handleVIsoCurve);
                    const vAdaptor = new this.occ.GeomAdaptor_Curve(handleUIsoCurve);


                }



            })

        } catch (error) {
            console.error(error);
        }


    }

    lengthOfCurve(geomAdaptor, min, max, segment = 5) {
        const gpPnt = new this.occ.gp_Pnt();
        let length = 0;
        for (let i = min; i <= max; s += (max - min) / segment) {
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
        this.#forEach(shape, callback, occ.TopAbs_ShapeEnum.TopAbs_FACE);
    }

    forEachWire(shape, callback) {
        this.#forEach(shape, callback, occ.TopAbs_ShapeEnum.TopAbs_WIRE);
    }

    forEachShell(shape, callback) {
        this.#forEach(callback, occ.TopAbs_ShapeEnum.TopAbs_SHELL);
    }

    forEachVertex(shape, callback) {
        this.#forEach(shape, callback, occ.TopAbs_ShapeEnum.TopAbs_VERTEX);
    }
    forEachEdge(shape, callback) {
        const hashes = {};
        let index = 0;
        this.#forEach(shape, (edge) => {
            const hash = edge.HashCode(this.MAX_HASH);
            if (!hashes.hasOwnProperty(hash)) {
                hashes[hash] = index;
                callback(edge, index++);
            }
        }, occ.TopAbs_ShapeEnum.TopAbs_EDGE);
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

class Vec3 {
    constructor(x=0,y=0,z=0){
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

export { OpenCascadeHelper } 