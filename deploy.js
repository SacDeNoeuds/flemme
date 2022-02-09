/* eslint-disable */
// @ts-check
const gh = require('gh-pages')
const fs = require('fs')
const cp = require('child_process')
const path = require('path')

const paths = {
  output: () => path.resolve(__dirname, './dist'),
  folder: (folder) => path.resolve(__dirname, 'demo', folder),
}
fs.rmSync(paths.output(), { recursive: true, force: true })
fs.mkdirSync(paths.output())

const folders = ['with-react', 'with-superstruct', 'with-yup', 'with-zod']
folders.forEach((folder) => {
  cp.execSync(`cp -R ${paths.folder(folder)}/dist ${paths.output()}/${folder}`)
})

gh.publish(
  paths.output(),
  {
    branch: 'pages',
    message: 'Deploy demos',
  },
  (err) => {
    console.error('deploy failed')
    console.error(err)
  },
)
