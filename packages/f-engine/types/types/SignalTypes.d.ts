import type { Signal } from "../../types/Signal";
type SignalTypes<T> = {
    [k in keyof T]: Signal;
};
interface SignalsMap {
    'objectSelected': Signal;
    'intersectionsDetected': Signal;
    'objectAdded': Signal;
    'sceneGraphChanged': Signal;
    'sceneRendered': Signal;
    "transformModeChange": Signal;
    "objectRemoved": Signal;
}
export { SignalTypes, SignalsMap };
