/*
 * @Date: 2023-06-30 16:25:00
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-30 11:57:55
 * @FilePath: /threejs-demo/packages/f-utils/src/others/EventDispatcher.ts
 */
class EventDispatcher {
  private _listeners:{[key:string|symbol]:Array<Function>}
  constructor(){
    this._listeners = {}
  }
  addEventListener(type:string|symbol, listener:Function) {

    const listeners = this._listeners;

    if (listeners[type] === undefined) {
      listeners[type] = [];
    }

    if (listeners[type].indexOf(listener) === -1) {
      listeners[type].push(listener);
    }
  }

  hasEventListener(type:string|symbol, listener:Function) {
    if (this._listeners === undefined) return false;

    const listeners = this._listeners;

    return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;
  }

  removeEventListener(type:string|symbol, listener:Function) {
    const listenerArray = this._listeners[type];

    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener);

      if (index !== -1) {
        listenerArray.splice(index, 1);
      }
    }
  }

  dispatchEvent(type:string|string, ...arg: any[]) {

    const listenerArray = this._listeners[type];

    if (listenerArray !== undefined) {
      // Make a copy, in case listeners are removed while iterating.
      const array = listenerArray.slice(0);

      for (let i = 0, l = array.length; i < l; i++) {
        array[i].call(this, ...arg);
      }
    }
  }
}

export { EventDispatcher };
