import { ViewHelper as ViewHelperBase } from './ViewHelper';
import type { Camera } from 'three';
declare class ViewHelper extends ViewHelperBase {
    constructor(camera: Camera, domElement: HTMLElement);
}
export { ViewHelper };
