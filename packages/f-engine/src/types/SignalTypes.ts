/*
 * @Date: 2023-08-03 00:20:24
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-07 01:15:54
 * @FilePath: /threejs-demo/packages/f-engine/src/types/SignalTypes.ts
 */
import type { Signal } from "../../types/Signal"

type SignalTypes<T> = { [k in keyof T]: Signal }

interface SignalsMap {
    'objectSelected': Signal
    'intersectionsDetected': Signal
    'objectAdded': Signal
    'sceneGraphChanged': Signal
    'sceneRendered': Signal
    "transformModeChange": Signal
    "objectRemoved":Signal
}



export { SignalTypes, SignalsMap }