/* eslint-disable security/detect-non-literal-fs-filename */
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import deleteFiles from 'rollup-plugin-delete'
import visualizer from 'rollup-plugin-visualizer'
import { terser } from 'rollup-plugin-terser'

const isDebug = ['debug', 'dev', 'development'].includes(process.env.NODE_ENV)

const folders = {
  esm: './build/esm',
  cjs: './build/cjs',
}

const plugins = (output) => [
  deleteFiles({ targets: [output] }),
  resolve(),
  commonjs(),
  typescript({
    project: './tsconfig.json',
    module: 'ESNext',
    outDir: output,
    declaration: output === folders.esm,
    include: ['./src/**/*'],
    exclude: ['./src/**/*.spec.*'],
    sourceMap: false,
  }),
  !isDebug && terser(),
  visualizer({ filename: `${output}/stats.html`, gzipSize: true, sourcemap: true, template: 'sunburst' }),
]

const external = ['react', 'flemme']

export default [
  {
    input: {
      main: 'src/main.ts',
    },
    output: { dir: folders.esm, format: 'esm', sourcemap: true },
    external,
    plugins: plugins(folders.esm),
  },
  // {
  //   input: {
  //     main: 'src/main.ts',
  //   },
  //   external,
  //   output: { dir: folders.cjs, format: 'cjs', sourcemap: true },
  //   plugins: plugins(folders.cjs),
  // },
]
