/*
 * @Date: 2023-07-06 14:18:30
 * @LastEditors: Yifan Wu 1208097313@qq.com
 * @LastEditTime: 2023-08-04 11:26:47
 * @FilePath: /threejs-demo/examples/vite.config.ts
 */
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify:false,
    outDir: './build',
    lib: {
      entry: './index.html',
      name: 'f-utils',
      // formats: ['es', 'cjs', 'umd'],
      // fileName: (format) => `f-utils.${format}.js`,
    },
    rollupOptions: {
      external: ['three'],
      output: {
        globals: {
          three: 'THREE',
        },
      },
    },
  }
});
