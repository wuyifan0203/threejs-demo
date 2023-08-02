/*
 * @Date: 2023-07-06 14:18:30
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-03 01:11:13
 * @FilePath: /threejs-demo/packages/f-engine/vite.config.ts
 */
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts'


export default defineConfig({
  root: './example', // 添加这一行
  base: './',
  build: {
    minify:false,
    outDir: '../build',
    lib: {
      entry: '../src/index.ts',
      name: 'CadLibrary',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `cad.${format}.js`,
    },
    rollupOptions: {
      external: ['three'],
      output: {
        globals: {
          three: 'THREE',
        },
      },
    },
    emptyOutDir:true
  },
  plugins:[dts({
    entryRoot:'../src',
    outDir:"../types"
  })]
});
