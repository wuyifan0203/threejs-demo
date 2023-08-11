/*
 * @Date: 2023-07-06 14:18:30
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-11 10:23:58
 * @FilePath: /threejs-demo/packages/f-engine/vite.config.ts
 */
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';


export default defineConfig({
  root: './example', // 添加这一行
  base: './',
  resolve: {
    // 配置路径别名
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server:{
    open:true,
    port:3100
  },

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
