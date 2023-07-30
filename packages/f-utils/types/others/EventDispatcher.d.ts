declare class EventDispatcher {
    private _listeners;
    constructor();
    addEventListener(type: string | symbol, listener: Function): void;
    hasEventListener(type: string | symbol, listener: Function): boolean;
    removeEventListener(type: string | symbol, listener: Function): void;
    dispatchEvent(type: string | string, ...arg: any[]): void;
}
export { EventDispatcher };
