// rollup.config.js
import {terser} from 'rollup-plugin-terser'
export default {
    input: 'src/index.js',
    output: [
        {
            file: 'build/cad.cjs.js',
            format: 'cjs'
          },
          {
            file: 'build/cad.esm.js',
            format: 'esm'
          },
          {
            file: 'build/cad.min.js',
            format: 'iife',
            name: 'version',
            plugins: [terser()]
          }
    ],
    plugins:[
    ]
  };