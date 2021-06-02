import { build } from 'esbuild'
import fastGlob from 'fast-glob'
import { remove } from 'fs-extra'
import { mkdir } from 'fs/promises'
import path from 'path'

import { fileURLToPath } from 'url'

const directoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../')
const directoryLibTest = path.join(directoryRoot, 'lib/test')
const directoryTest = path.join(directoryRoot, 'test')
// const directorySrc = path.join(directoryRoot, 'src')

await remove(directoryLibTest)
await mkdir(directoryLibTest, { recursive: true })

const entryPoints = await fastGlob(['**/*.spec.?(m)(j|t)s?(x)'], {
  absolute: true,
  cwd: directoryTest,
  dot: true
})

process.cwd(directoryRoot)

await build({
  entryPoints,
  sourcemap: true,
  bundle: true,
  platform: 'node',
  target: 'node14.17.0',
  format: 'esm',
  outbase: directoryRoot,
  outdir: directoryLibTest,
  logLevel: 'info'
})
