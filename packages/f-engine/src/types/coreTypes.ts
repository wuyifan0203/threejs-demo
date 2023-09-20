/*
 * @Date: 2023-09-18 17:44:24
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-09-20 20:37:45
 * @FilePath: /threejs-demo/packages/f-engine/src/types/coreTypes.ts
 */
type Uuids = Array<string>;

type OptionModeType = 'select' | 'translate' | 'rotate' | 'scale';

type EventBusType = {
    renderPort: () => void;
    [key:string]:any;
}

export { 
    Uuids, 
    OptionModeType, 
    EventBusType,  
}