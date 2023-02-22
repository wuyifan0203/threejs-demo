import { Vector3 } from "./three.module.js";

export const MOUSESTYLE = {
    SELECT:'default',
    PAN:'move',
    ZOOM:'zoom-in',
    ROTATE:'alias'
}

export const VIEWPOSITION = {
    '3D': new Vector3(1000, 1000, 1000),
    'XY': new Vector3(0, 0, 1000),
    'XZ': new Vector3(0, 1000, 0),
    'YZ': new Vector3(1000, 0, 0),
}

export const S = 15;