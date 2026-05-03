import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Compiler } from 'inkjs/full'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = resolve(rootDir, 'src/game/narrative/ink')
const sourcePath = resolve(rootDir, 'src/game/narrative/ink/chapter-1.ink')
const outputPath = resolve(rootDir, 'public/stories/chapter-1.json')
const checkOnly = process.argv.includes('--check')

const fileHandler = {
  ResolveInkFilename(filename) {
    return resolve(sourceDir, filename)
  },
  LoadInkFileContents(filename) {
    return readFileSync(filename, 'utf8').replace(/^\uFEFF/, '')
  },
}

const source = fileHandler.LoadInkFileContents(sourcePath)
const compiled = new Compiler(source, {
  sourceFilename: sourcePath,
  fileHandler,
}).Compile().ToJson()
const output = `${compiled}\n`

if (checkOnly) {
  const currentOutput = existsSync(outputPath) ? readFileSync(outputPath, 'utf8').replace(/^\uFEFF/, '') : ''
  if (currentOutput !== output) {
    console.error(`Ink story JSON is out of date: ${outputPath}`)
    console.error('Run npm run compile:ink and commit the generated story JSON.')
    process.exitCode = 1
  } else {
    console.log(`Ink story JSON is up to date: ${outputPath}`)
  }
  process.exit()
}

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, output, 'utf8')
console.log(`Compiled ${sourcePath} -> ${outputPath}`)
