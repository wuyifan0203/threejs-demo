/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2023-01-10 18:16:13
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2024-05-31 16:38:14
 * @FilePath: /threejs-demo/src/lib/tools/datGUIutils.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
export function addMaterialGUI(gui,controls,material,name) {
    const folderName = name !== undefined ? name : 'Material';
    controls.material = material;

    console.log(controls);

    const folder = gui.addFolder(folderName);
    folder.addColor(controls.material, 'color');
    folder.add(controls.material, 'opacity', 0, 1, 0.01);
    folder.add(controls.material, 'transparent');
    folder.add(controls.material, 'visible');
    folder.add(controls.material, 'wireframe');
    folder.add(controls.material, 'side', {FrontSide: 0, BackSide: 1, BothSides: 2}).onChange(function (side) {
        controls.material.side = parseInt(side)
    });
    folder.add(controls.material, 'fog');

    return folder
}

export function addSpecificMaterialSettings(gui, controls, material, name) {
    controls.material = material;
    
    var folderName = (name !== undefined) ? name : 'THREE.' + material.type;
    var folder = gui.addFolder(folderName);
    switch (material.type) {
        case "MeshNormalMaterial":
            folder.add(controls.material,'wireframe');
            return folder;

        case "MeshPhongMaterial":
            controls.specular = material.specular.getStyle();
            folder.addColor(controls, 'specular').onChange(function (e) {
                material.specular.setStyle(e)
            });
            folder.add(material, 'shininess', 0, 100, 0.01);
            return folder;            
            
        case "MeshStandardMaterial":
            controls.color = material.color.getStyle();
            folder.addColor(controls, 'color').onChange(function (e) {
                material.color.setStyle(e)
            });
            controls.emissive = material.emissive.getStyle();
            folder.addColor(controls, 'emissive').onChange(function (e) {
                material.emissive.setStyle(e)                
            });
            folder.add(material, 'metalness', 0, 1, 0.01);
            folder.add(material, 'roughness', 0, 1, 0.01);
            folder.add(material, 'wireframe');

            return folder;
    }
}