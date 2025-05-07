/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-04-30 13:53:22
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-05-07 17:50:40
 * @FilePath: \threejs-demo\src\lib\custom\OpenCascadeShape.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
let openCascade;

class OpenCascadeShape {
    static setOpenCascade(occ) {
        openCascade = occ;
    }

    static Box({ xSpan, ySpan, zSpan }) {
        const box = new openCascade.BRepPrimAPI_MakeBox_2(xSpan, ySpan, zSpan);
        const shape = box.Shape();
        return this.transform({ x: -xSpan / 2, y: -ySpan / 2, z: -zSpan / 2 }, shape);
    }

    static Sphere({ radius }) {
        return new openCascade.BRepPrimAPI_MakeSphere_1(radius).Shape();
    }

    static Cylinder({ radius, height, angle }) {
        const shape = new openCascade.BRepPrimAPI_MakeCylinder_2(radius, height, angle).Shape();
        return this.transform({ x: 0, y: 0, z: -height / 2 }, shape);
    }
    static Cone({ radius1, radius2, height, angle }) {
        const shape = new openCascade.BRepPrimAPI_MakeCone_2(radius1, radius2, height, angle).Shape();
        return this.transform({ x: 0, y: 0, z: -height / 2 }, shape);
    }

    static Tours({ outerRadius, innerRadius, startAngle, endAngle }) {
        const shape = new openCascade.BRepPrimAPI_MakeTorus_3(outerRadius, innerRadius, startAngle, endAngle).Shape();
        return shape;
    }
    // half face
    // revol
    // prism
    // Revolution
    // wedge

    static transform(offset, occShape) {
        const transformation = new openCascade.gp_Trsf_1();
        transformation.SetTranslation_1(new openCascade.gp_Vec_4(offset.x, offset.y, offset.z));
        const translation = new openCascade.TopLoc_Location_2(transformation);
        return occShape.Moved(translation, true);
    }
}


export { OpenCascadeShape }