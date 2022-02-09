/* eslint-disable */
// @ts-check
const gh = require('gh-pages')
const fs = require('fs')
const cp = require('child_process')
const path = require('path')

const paths = {
  dist: () => path.resolve(__dirname, './dist'),
  folder: (folder) => path.resolve(__dirname, folder),
}
fs.rmSync(paths.dist(), { recursive: true, force: true })
fs.mkdirSync(paths.dist())

const folders = ['with-react', 'with-superstruct', 'with-yup', 'with-zod']
folders.forEach((folder) => {
  cp.execSync(`cp -R ${paths.folder(folder)}/dist ${paths.dist()}/${folder}`)
})

gh.publish(
  'dist',
  {
    branch: 'pages',
    message: 'Deploy demos',
  },
  (error) => {
    console.error('deploy failed:', error)
  },
)
