/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-04-30 13:53:22
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-05-26 17:33:51
 * @FilePath: \threejs-demo\src\lib\custom\OpenCascadeShape.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */

class OpenCascadeShape {
    constructor(occ) {
        this.occ = occ;
    }

    Box({ xSpan, ySpan, zSpan }) {
        const box = new this.occ.BRepPrimAPI_MakeBox_2(xSpan, ySpan, zSpan);
        const shape = box.Shape();
        return this.transform({ x: -xSpan / 2, y: -ySpan / 2, z: -zSpan / 2 }, shape);
    }

    Sphere({ radius }) {
        return new this.occ.BRepPrimAPI_MakeSphere_1(radius).Shape();
    }

    Cylinder({ radius, height, angle }) {
        const shape = new this.occ.BRepPrimAPI_MakeCylinder_2(radius, height, angle).Shape();
        return this.transform({ x: 0, y: 0, z: -height / 2 }, shape);
    }
    Cone({ radius1, radius2, height, angle }) {
        const shape = new this.occ.BRepPrimAPI_MakeCone_2(radius1, radius2, height, angle).Shape();
        return this.transform({ x: 0, y: 0, z: -height / 2 }, shape);
    }

    Tours({ outerRadius, innerRadius, startAngle, endAngle }) {
        const shape = new this.occ.BRepPrimAPI_MakeTorus_3(outerRadius, innerRadius, startAngle, endAngle).Shape();
        return shape;
    }

    Shape({ x, y }) {
        const that = this;
        const scope = {
            startPoint: new that.occ.gp_Pnt(x, y, 0),
            endPoint: startPoint,
            wireBuilder: new that.occ.BRepBuilderAPI_MakeWire(),
            Start({ x, y }) {
                this.startPoint = new that.occ.gp_Pnt(x, y, 0);
                this.endPoint = this.startPoint;
                this.wireBuilder = new that.occ.BRepBuilderAPI_MakeWire();
                return this;
            },
            LineTo({ x, y }) {
                const nextPoint = new that.occ.gp_Pnt(x, y, 0);
                if (nextPoint.X() === this.endPoint.X() && nextPoint.Y() === this.endPoint.Y()) {
                    return scope;
                } else {
                    const edge = new that.occ.BRepBuilderAPI_MakeEdge();
                }
            }
        };
    }

    // half face
    // revol
    // prism
    // Revolution
    // wedge

    transform(offset, shape) {
        const transformation = new this.occ.gp_Trsf_1();
        transformation.SetTranslation_1(new this.occ.gp_Vec_4(offset.x, offset.y, offset.z));
        const translation = new openCascade.TopLoc_Location_2(transformation);
        return shape.Moved(translation, true);
    }
}


export { OpenCascadeShape }