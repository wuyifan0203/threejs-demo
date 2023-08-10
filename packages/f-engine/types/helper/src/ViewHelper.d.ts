import { Camera, Object3D, Vector3 } from 'three';
declare class ViewHelper extends Object3D {
    object: any;
    isViewHelper: boolean;
    animating: boolean;
    center: Vector3;
    render: (renderer: any) => void;
    handleClick: (event: any) => boolean;
    update: (delta: any) => void;
    dispose: () => void;
    constructor(camera: Camera, domElement: HTMLElement);
}
export { ViewHelper };
