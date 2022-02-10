/* eslint-disable */
// @ts-check
const gh = require('gh-pages')
const fs = require('fs')
const cp = require('child_process')
const path = require('path')

const debug = (...args) => console.info(...args)

const paths = {
  output: () => path.resolve(__dirname, './build'),
  folder: (folder) => path.resolve(__dirname, 'demo', folder),
  bindings: {
    react: () => path.resolve(__dirname, './bindings/react'),
  },
}
fs.rmSync(paths.output(), { recursive: true, force: true })
fs.mkdirSync(paths.output())

Object.values(paths.bindings).forEach((bindingFolder) => {
  debug(`\n\n--- Install & build bindings/${path.basename(bindingFolder())} ---`)
  cp.execSync('npm i && NODE_ENV=production npm run build', {
    cwd: bindingFolder(),
    stdio: 'inherit',
  })
})

const folders = ['with-react', 'with-superstruct', 'with-yup', 'with-zod']
folders.forEach((folder) => {
  debug(`\n\n--- Install & build demo/${path.basename(paths.folder(folder))} ---`)
  cp.execSync('npm ci && npm run build', { cwd: paths.folder(folder), stdio: 'inherit' })
  cp.execSync(`cp -R ${paths.folder(folder)}/dist ${paths.output()}/${folder}`, { stdio: 'inherit' })
})

gh.publish(
  paths.output(),
  {
    branch: 'pages',
    message: 'Deploy demos',
    dest: '.',
  },
  (err) => {
    err ? console.error('deploy failed', err) : console.info('Deploy succeeded')
  },
)

cp.execSync('rm -rf ./bindings/*/node_modules ./demo/*/node_modules', { stdio: 'inherit' })
