/*
 * @Date: 2023-08-03 00:20:24
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-10 19:54:52
 * @FilePath: /threejs-demo/packages/f-engine/src/types/SignalTypes.ts
 */
import type { Signal } from "signals"

type SignalTypes<T> = { [k in keyof T]: Signal }

interface SignalsMap {
    'objectsSelected': Signal
    'intersectionsDetected': Signal
    'objectsAdded': Signal
    'sceneGraphChanged': Signal
    'sceneRendered': Signal
    "transformModeChange": Signal
    "objectsRemoved":Signal
}



export { SignalTypes, SignalsMap }