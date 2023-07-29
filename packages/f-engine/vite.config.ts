/*
 * @Date: 2023-07-06 14:18:30
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-30 02:47:18
 * @FilePath: /threejs-demo/packages/f-engine/vite.config.ts
 */
import { defineConfig } from 'vite';

export default defineConfig({
  root: './example', // 添加这一行
  base: './',
  build: {
    minify:false,
    outDir: '../build',
    lib: {
      entry: '../src/index.js',
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
});
