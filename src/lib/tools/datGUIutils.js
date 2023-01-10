/*
 * @Date: 2023-01-10 18:16:13
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-01-10 19:21:42
 * @FilePath: /threejs-demo/src/lib/tools/datGUIutils.js
 */
export function addMaterialGUI(gui,controls,material,name) {
    const folderName = name !== undefined ? name : 'Material';
    controls.material = material;

    const folder = gui.addFolder(folderName);
    folder.addColor(controls.material, 'color');
    folder.add(controls.material, 'opacity', 0, 1, 0.01);
    folder.add(controls.material, 'transparent');
    folder.add(controls.material, 'overdraw', 0, 1, 0.01);
    folder.add(controls.material, 'visible');
    folder.add(controls.material, 'side', {FrontSide: 0, BackSide: 1, BothSides: 2}).onChange(function (side) {
        controls.material.side = parseInt(side)
    });
    folder.add(controls.material, 'fog');

    return folder

    
}