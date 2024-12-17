/* eslint-disable security/detect-non-literal-fs-filename */
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { visualizer } from 'rollup-plugin-visualizer'

const isDebug = ['debug', 'dev', 'development'].includes(process.env.NODE_ENV)

const folders = {
  esm: './lib/esm',
  cjs: './lib/cjs',
}

const plugins = (output) => [
  resolve(),
  commonjs(),
  typescript({
    project: './tsconfig.json',
    module: 'ESNext',
    outDir: output,
    declaration: output === folders.esm,
    include: ['./src/**/*'],
    exclude: ['./src/**/*.spec.*'],
    sourceMap: true,
  }),
  !isDebug && terser(),
  visualizer({ filename: `${output}/stats.html`, gzipSize: true, sourcemap: true, template: 'sunburst' }),
]

export default [
  {
    input: {
      main: 'src/main.ts',
    },
    output: { dir: folders.esm, format: 'esm', sourcemap: true },
    plugins: plugins(folders.esm),
  },
  {
    input: {
      main: 'src/main.ts',
    },
    output: { dir: folders.cjs, format: 'cjs', sourcemap: true },
    plugins: plugins(folders.cjs),
  },
]
