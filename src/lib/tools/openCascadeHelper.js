/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-04-29 09:56:12
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-04-30 15:24:14
 * @FilePath: \threejs-demo\src\lib\tools\openCascadeHelper.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */

let openCascade = null;
class OpenCascadeHelper {
    static setOpenCascade(occ) {
        openCascade = occ;
    }
    static #tessellate(shape) {
        const faceList = [];
        new openCascade.BRepMesh_IncrementalMesh_2(shape, 0.1, false, 0.1, true);
        const ExpFace = new openCascade.TopExp_Explorer_1();
        for (ExpFace.Init(shape, openCascade.TopAbs_ShapeEnum.TopAbs_FACE, openCascade.TopAbs_ShapeEnum.TopAbs_SHAPE); ExpFace.More(); ExpFace.Next()) {
            const myFace = openCascade.TopoDS.Face_1(ExpFace.Current());
            const aLocation = new openCascade.TopLoc_Location_1();
            const myT = openCascade.BRep_Tool.Triangulation(myFace, aLocation, 0 /* == Poly_MeshPurpose_NONE */);
            if (myT.IsNull()) {
                continue;
            }

            const this_face = {
                vertex_coord: [],
                normal_coord: [],
                tri_indexes: [],
                number_of_triangles: 0,
            };

            const pc = new openCascade.Poly_Connect_2(myT);
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
            const myNormal = new openCascade.TColgp_Array1OfDir_2(1, triangulation.NbNodes());
            openCascade.StdPrs_ToolTriangulatedShape.Normal(myFace, pc, myNormal);
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
                if (orient !== openCascade.TopAbs_Orientation.TopAbs_FORWARD) {
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
    static #joinPrimitives(faceList) {
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
    static #generateBuffer(triangleCount, vertexCoord, normalCoord, indices) {

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
    static #getTriangle(triangleIndex, indices) {
        const pA = indices[(triangleIndex * 3) + 0] * 3;
        const pB = indices[(triangleIndex * 3) + 1] * 3;
        const pC = indices[(triangleIndex * 3) + 2] * 3;

        const vertices = [pA, pB, pC];
        const normals = [pA, pB, pC];
        const texcoords = [pA, pB, pC];
        return { vertices, normals, texcoords };
    }

    static convertBuffer(shape) {
        if (!openCascade) return console.error('openCascade not initialized,need `setOpenCascade`');
        const faceList = this.#tessellate(shape);
        const [vertexCoord, normalCoord, indices] = this.#joinPrimitives(faceList);
        const triangleCount = faceList.reduce((a, b) => a + b.number_of_triangles, 0);
        return this.#generateBuffer(triangleCount, vertexCoord, normalCoord, indices);
    }
}

export { OpenCascadeHelper } 