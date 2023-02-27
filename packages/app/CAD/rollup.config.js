// rollup.config.js
import {terser} from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
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
            plugins: [terser()],
            globals: {
                three: 'THREE'
              }
          }
    ],
    plugins:[
        resolve({
            // 将自定义选项传递给解析插件
            customResolveOptions: {
                moduleDirectories: ['node_modules']
            },
            browser: true,
          })
    ],
    
    external: ['three']
  };