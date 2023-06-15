/*
 * @Date: 2023-04-03 17:25:42
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-06-15 14:13:43
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
      globals:{
        'three':'THREE'
      }
    },
    {
      file: 'build/cad.esm.js',
      format: 'esm',
      globals:{
        'three':'THREE'
      }
    },
    {
      file: 'build/cad.min.js',
      format: 'iife',
      name: 'version',
      plugins: [terser()],
      globals:{
        'three':'THREE'
      }
    }
  ],
  plugins: [
    resolve({
      // 将自定义选项传递给解析插件
      customResolveOptions: {
        moduleDirectories: ['node_modules']
      }
    })
  ],
  external: ['three']
};
