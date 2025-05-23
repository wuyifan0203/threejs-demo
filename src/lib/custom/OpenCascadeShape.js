/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-04-30 13:53:22
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-05-23 10:16:39
 * @FilePath: \threejs-demo\src\lib\custom\OpenCascadeShape.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */

class OpenCascadeShape {
    constructor(occ) {
        this.occ = occ;
        this.axis = new this.occ.gp_Ax2();
    }

    Box({ xSpan, ySpan, zSpan }) {
        const box = new this.occ.BRepPrimAPI_MakeBox(xSpan, ySpan, zSpan);
        const shape = box.Shape();
        return this.transform({ x: -xSpan / 2, y: -ySpan / 2, z: -zSpan / 2 }, shape);
    }

    Sphere({ radius }) {
        return new this.occ.BRepPrimAPI_MakeSphere(radius).Shape();
    }

    Cylinder({ radius, height, angle }) {
        const shape = new this.occ.BRepPrimAPI_MakeCylinder(this.axis, radius, height, angle).Shape();
        return this.transform({ x: 0, y: 0, z: -height / 2 }, shape);
    }
    Cone({ radius1, radius2, height, angle }) {
        const shape = new this.occ.BRepPrimAPI_MakeCone(radius1, radius2, height, angle).Shape();
        return this.transform({ x: 0, y: 0, z: -height / 2 }, shape);
    }

    Tours({ outerRadius, innerRadius, startAngle, endAngle }) {
        const shape = new this.occ.BRepPrimAPI_MakeTorus(this.axis, outerRadius, innerRadius, startAngle, endAngle).Shape();
        return shape;
    }
    // half face
    // revol
    // prism
    // Revolution
    // wedge

    transform(offset, shape) {
        const transformation = new this.occ.gp_Trsf();
        transformation.SetTranslation(new this.occ.gp_Vec(offset.x, offset.y, offset.z));
        const translation = new this.occ.TopLoc_Location(transformation);
        return shape.Moved(translation, true);
    }
}


export { OpenCascadeShape }