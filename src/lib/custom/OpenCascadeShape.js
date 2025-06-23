/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-04-30 13:53:22
 * @LastEditors: wuyifan 1208097313@qq.com
 * @LastEditTime: 2025-06-23 01:58:29
 * @FilePath: /threejs-demo/src/lib/custom/OpenCascadeShape.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */

class OpenCascadeShape {
    constructor(occ) {
        this.occ = occ;
    }

    Box({ xSpan, ySpan, zSpan }) {
        const box = new this.occ.BRepPrimAPI_MakeBox_2(xSpan, ySpan, zSpan);
        const shape = box.Shape();
        return this.transform(shape, { x: -xSpan / 2, y: -ySpan / 2, z: -zSpan / 2 });
    }

    Sphere({ radius }) {
        return new this.occ.BRepPrimAPI_MakeSphere_1(radius).Shape();
    }

    Cylinder({ radius, height, angle }) {
        const shape = new this.occ.BRepPrimAPI_MakeCylinder_2(radius, height, angle).Shape();
        return this.transform(shape, { x: 0, y: 0, z: -height / 2 });
    }
    Cone({ radius1, radius2, height, angle }) {
        const shape = new this.occ.BRepPrimAPI_MakeCone_2(radius1, radius2, height, angle).Shape();
        return this.transform(shape, { x: 0, y: 0, z: -height / 2 });
    }

    Tours({ outerRadius, innerRadius, startAngle, endAngle }) {
        const shape = new this.occ.BRepPrimAPI_MakeTorus_3(outerRadius, innerRadius, startAngle, endAngle).Shape();
        return shape;
    }

    Polygon(points) {
        const pnts = [];
        for (const point of points) {
            pnts.push(new this.occ.gp_Pnt_3(point.x, point.y, point.z));
        }
    }
    EllipseSphere({ radiusX, radiusY, radiusZ }) {
        const sphere = this.Sphere({ radius: 1 });

        const scaleMatrix = new this.occ.gp_GTrsf_1();
        const axis = new this.occ.gp_Ax2_3(new this.occ.gp_Pnt_3(0, 0, 0), new this.occ.gp_Dir_4(0, 0, 1));
        scaleMatrix.SetAffinity_2(axis, 1);
        scaleMatrix.SetVectorialPart(
            new this.occ.gp_Mat_2(
                radiusX, 0, 0,
                0, radiusY, 0,
                0, 0, radiusZ
            )
        );

        const brepTrsf = new this.occ.BRepBuilderAPI_GTransform_2(sphere, scaleMatrix, true);
        brepTrsf.Build(new this.occ.Message_ProgressRange_1());

        if (!brepTrsf.IsDone()) {
            throw new Error("椭球体构造失败");
        }

        return brepTrsf.Shape();
    }

    // half face
    // revol
    // prism
    // Revolution
    // wedge,
    transform(shape, { x, y, z }) {
        const transformation = new this.occ.gp_Trsf_1();
        transformation.SetTranslation_1(new this.occ.gp_Vec_4(x, y, z));
        const translation = new this.occ.TopLoc_Location_2(transformation);
        return shape.Moved(translation, true);
    }
}


export { OpenCascadeShape }