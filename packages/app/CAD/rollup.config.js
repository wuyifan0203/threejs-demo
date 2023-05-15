/*
 * @Date: 2023-04-03 17:25:42
 * @LastEditors: wuyifan wuyifan@max-optics.com
 * @LastEditTime: 2023-05-15 15:23:15
 * @FilePath: /threejs-demo/packages/app/CAD/rollup.config.js
 */
// rollup.config.js
import { terser } from 'rollup-plugin-terser';

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
  ],
};
