/*
 * @Date: 2023-04-03 17:25:42
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-13 01:14:34
 * @FilePath: /threejs-demo/packages/app/CAD/rollup.config.js
 */
// rollup.config.js
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'build/cad.cjs.js',
      format: 'cjs',
    },
    {
      file: 'build/cad.esm.js',
      format: 'esm',
    },
    {
      file: 'build/cad.min.js',
      format: 'iife',
      name: 'version',
      plugins: [terser()],
    },
  ],
  plugins: [
    resolve({
      // 将自定义选项传递给解析插件
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    })
  ],
  external: ['three']
};
