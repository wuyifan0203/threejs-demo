/*
 * @Date: 2023-07-06 14:18:30
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-07-31 01:50:33
 * @FilePath: /threejs-demo/packages/f-utils/vite.config.ts
 */
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    minify:false,
    outDir: './build',
    lib: {
      entry: './src/index.ts',
      name: 'f-utils',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `f-utils.${format}.js`,
    },
    rollupOptions: {
      external: ['three'],
      output: {
        globals: {
          three: 'THREE',
        },
      },
    },
  },
  plugins:[dts({
    entryRoot:'./src',
    outDir:"./types"
  })]
});
