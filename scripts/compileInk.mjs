import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Compiler } from 'inkjs/full'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = resolve(rootDir, 'src/game/narrative/ink/chapter-1.ink')
const outputPath = resolve(rootDir, 'public/stories/chapter-1.json')

const includePattern = /^INCLUDE\s+(.+)$/gm

function loadInkFile(path, seen = new Set()) {
  if (seen.has(path)) return ''
  seen.add(path)

  const source = readFileSync(path, 'utf8').replace(/^\uFEFF/, '')
  return source.replace(includePattern, (_, includePath) => {
    const resolvedInclude = resolve(dirname(path), includePath.trim())
    return loadInkFile(resolvedInclude, seen)
  })
}

const source = loadInkFile(sourcePath)
const compiled = new Compiler(source).Compile().ToJson()

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${compiled}\n`, 'utf8')
console.log(`Compiled ${sourcePath} -> ${outputPath}`)
