/*
 * @Author: wuyifan0203 1208097313@qq.com
 * @Date: 2025-03-20 15:35:11
 * @LastEditors: wuyifan0203 1208097313@qq.com
 * @LastEditTime: 2025-03-20 15:36:02
 * @FilePath: \threejs-demo\src\lib\custom\Float64BufferAttribute.js
 * Copyright (c) 2024 by wuyifan email: 1208097313@qq.com, All Rights Reserved.
 */
import { BufferAttribute } from 'three';

class Float64BufferAttribute extends BufferAttribute {
  constructor(array, itemSize, normalized = false) {
    super(new Float64Array(array), itemSize, normalized);
  }
}
export { Float64BufferAttribute };