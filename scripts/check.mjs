// The gate: node scripts/check.mjs [--update] [--static]
//  1. every command in data/lessons.json is run against a real Docker daemon and must exit 0 and match its `expect`
//  2. with --update, the output of each run is written back as the transcript the page prints, plus data/verified.json
//     and data/measured.json (layer sizes and which build steps are cached after each kind of edit, from real builds)
//  3. every internal link resolves, no external font or script request, and a claim lint refuses phrases from the first review
//  --static skips the Docker runs and checks only 3 and the data files' shape.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const update = process.argv.includes('--update')
const staticOnly = process.argv.includes('--static')
const problems = []
const bad = (m) => problems.push(m)
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8')

const sh = (cmd, cwd, timeout = 300000) => {
  const r = spawnSync('bash', ['-c', cmd], { cwd, encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024 })
  return { code: r.status === null ? 124 : r.status, out: ((r.stdout || '') + (r.stderr || '')).replace(/\x1b\[[0-9;]*m/g, '') }
}
const copyDir = (from, to) => fs.cpSync(path.join(root, from), to, { recursive: true })

if (process.argv.includes('--measure')) { measureOnly() }
function measureOnly() { /* defined below; run after function declarations are hoisted */ measure(); console.log('measured'); process.exit(problems.length ? 1 : 0) }

// ---------------------------------------------------------------- static checks
const pages = fs.readdirSync(root).filter((f) => f.endsWith('.html'))
for (const p of pages) {
  const html = read(p)
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const u = m[1]
    if (/^(https?:|mailto:|#|data:)/.test(u)) continue
    const f = u.split('#')[0].split('?')[0]
    if (f && !fs.existsSync(path.join(root, f))) bad(`${p}: dead link ${u}`)
  }
  if (/fonts\.googleapis|cdn\.|unpkg|jsdelivr/.test(html)) bad(`${p}: external request`)
  const text = html.replace(/<script[\s\S]*?<\/script>|<[^>]+>/g, ' ').toLowerCase()
  for (const w of ['one-stop', 'powerful platform', 'level up', 'harness', 'all rights reserved', 'state-of-the-art', 'in-depth', 'interactive labs', 'upcoming webinar', 'docker-compose up'])
    if (text.includes(w)) bad(`${p}: banned phrase "${w}"`)
}
{ // every data-fig key a page uses must be computed by assets/common.js
  const src = read('assets/common.js')
  const known = new Set([...src.matchAll(/\b(docker|compose|date|arch|base|lessons|commands|image|copybytes|npmbytes)\s*:/g)].map((m) => m[1]))
  for (const p of pages) for (const m of read(p).matchAll(/data-fig="([^"]+)"/g)) if (!known.has(m[1])) bad(`${p}: data-fig="${m[1]}" is not computed by assets/common.js`)
}
for (const f of fs.readdirSync(path.join(root, 'assets')).filter((x) => x.endsWith('.css'))) {
  if (/@import url\(['"]?https?:/.test(read('assets/' + f))) bad(`assets/${f}: external @import`)
}

const lessons = JSON.parse(read('data/lessons.json'))
for (const l of lessons) {
  if (!l.id || !l.steps?.length) bad(`lesson ${l.id}: no steps`)
  for (const s of l.steps) {
    if (!s.cmd || !s.expect) { bad(`lesson ${l.id}: a step has no cmd or expect`); continue }
    // the output printed on the page must itself satisfy the step's expectation (unless it was filtered with show/tail)
    if (s.out && !s.show && !s.tail && !new RegExp(s.expect, 'm').test(s.out)) bad(`lesson ${l.id}: printed output of \`${s.cmd}\` does not match /${s.expect}/`)
  }
}

// ---------------------------------------------------------------- docker runs
function dockerOk() { return sh('docker info --format "{{.ServerVersion}}"', root, 30000) }
if (!staticOnly) {
  const d = dockerOk()
  if (d.code !== 0) { bad('no Docker daemon is reachable: start Docker, or run with --static'); }
  else {
    const dockerVersion = d.out.trim()
    const compose = sh('docker compose version --short', root, 30000).out.trim()
    for (const l of lessons) {
      const base = fs.mkdtempSync(path.join(os.tmpdir(), 'ld-' + l.id + '-'))
      const dir = path.join(base, l.dirName || l.id) // Compose names the project after this folder, so the printed output uses a readable name
      fs.mkdirSync(dir)
      if (l.files) copyDir(l.files, l.filesAs ? path.join(dir, l.filesAs) : dir)
      for (const [name, body] of Object.entries(l.extra || {})) fs.writeFileSync(path.join(dir, name), body)
      for (const s of l.steps) {
        const r = sh(s.cmd, dir)
        let out = r.out.replace(/SWMTKN-[\w-]+/g, 'SWMTKN-...').replace(/\r/g, '').trimEnd()
        // `show` keeps only the lines a reader needs; the page says when output is filtered
        let lines = s.show ? out.split('\n').filter((x) => new RegExp(s.show).test(x)) : out.split('\n')
        // BuildKit reports parallel steps as they finish; print them in Dockerfile order
        if (s.show) lines = lines.map((x, i) => [x, i]).sort((a, b) => { const k = (t) => { const m = t[0].match(/\[(\d+)\/\d+\]/); return m ? +m[1] : 99 }; return k(a) - k(b) || a[1] - b[1] }).map((p) => p[0])
        const keep = s.tail || 14
        const shown = lines.length > keep ? (s.tail ? lines.slice(-keep) : lines.slice(0, keep).concat(['...'])) : lines
        if (r.code !== 0) bad(`${l.id}: \`${s.cmd}\` exited ${r.code}\n${out.slice(-400)}`)
        else if (!new RegExp(s.expect, 'm').test(out)) bad(`${l.id}: \`${s.cmd}\` output did not match /${s.expect}/\n${out.slice(-400)}`)
        if (update) s.out = shown.join('\n')
      }
      for (const c of l.cleanup || []) sh(c, dir, 120000)
      fs.rmSync(base, { recursive: true, force: true })
    }
    if (update) {
      fs.writeFileSync(path.join(root, 'data/lessons.json'), JSON.stringify(lessons, null, 2) + '\n')
      const base = (read('lab/hello-node/Dockerfile').match(/^FROM\s+(\S+)/m) || [])[1]
      fs.writeFileSync(path.join(root, 'data/verified.json'), JSON.stringify({ docker: dockerVersion, compose, base, date: new Date().toISOString().slice(0, 10), arch: sh('uname -m', root).out.trim() }, null, 2) + '\n')
      measure()
    }
  }
}

// ---------------------------------------------------------------- measure: real builds
function measure() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ld-measure-'))
  copyDir('lab/hello-node', dir)
  const tag = 'ld-measure'
  const orig = { server: fs.readFileSync(path.join(dir, 'server.js'), 'utf8'), pkg: fs.readFileSync(path.join(dir, 'package.json'), 'utf8'), df: fs.readFileSync(path.join(dir, 'Dockerfile'), 'utf8') }
  const reset = () => { fs.writeFileSync(path.join(dir, 'server.js'), orig.server); fs.writeFileSync(path.join(dir, 'package.json'), orig.pkg); fs.writeFileSync(path.join(dir, 'Dockerfile'), orig.df) }
  const build = (extra = '') => {
    const r = sh(`docker build --progress=plain ${extra} -t ${tag} . 2>&1`, dir, 600000)
    if (r.code !== 0) { bad('measure: build failed\n' + r.out.slice(-400)); return [] }
    const names = {}, steps = []
    for (const line of r.out.split('\n')) {
      let m = line.match(/^#(\d+) \[(\d+)\/(\d+)\] (.+)$/)
      if (m && !/^\[internal\]/.test(line.slice(line.indexOf('['))) ) { names[m[1]] = { n: +m[2], of: +m[3], text: m[4].replace(/^FROM docker\.io\/library\//, 'FROM ').replace(/@sha256:[0-9a-f]+/, '') } }
      m = line.match(/^#(\d+) (CACHED|DONE ([\d.]+)s)/)
      if (m && names[m[1]] && !steps.find((s) => s.id === m[1])) steps.push({ id: m[1], ...names[m[1]], cached: m[2] === 'CACHED', secs: m[3] ? +m[3] : 0 })
    }
    // A FROM step that finishes at once means the base image was already on this machine; a pull takes seconds.
    return steps.sort((a, b) => a.n - b.n).map(({ n, text, cached, secs }) => ({ n, text, state: cached || (/^FROM /.test(text) && secs < 0.5) ? 'cached' : 'rebuilt', secs }))
  }
  const baseline = () => { reset(); build() }
  const scenarios = []
  reset(); sh(`docker rmi -f ${tag}`, dir); sh('docker builder prune -af', dir) // an empty build cache: the base image stays, every step must run
  scenarios.push({ id: 'first', label: 'First build', change: 'The build cache is empty.', steps: build() })
  scenarios.push({ id: 'same', label: 'Build again', change: 'You changed nothing.', steps: build() })
  baseline(); fs.appendFileSync(path.join(dir, 'server.js'), '\n// a comment\n')
  scenarios.push({ id: 'code', label: 'Edit server.js', change: 'You edited one source file.', steps: build() })
  baseline(); fs.writeFileSync(path.join(dir, 'package.json'), orig.pkg.replace('"version": "1.0.0"', '"version": "1.0.1"'))
  scenarios.push({ id: 'pkg', label: 'Edit package.json', change: 'You changed the version in package.json.', steps: build() })
  baseline(); fs.writeFileSync(path.join(dir, 'Dockerfile'), orig.df.replace('node:24-alpine', 'node:22-alpine'))
  scenarios.push({ id: 'base', label: 'Change the base image', change: 'You changed FROM node:24-alpine to node:22-alpine.', steps: build() })
  reset(); build()
  const hist = sh(`docker history --no-trunc --human=false --format '{{.Size}}\t{{.CreatedBy}}' ${tag}`, dir).out.trim().split('\n').map((l) => { const [size, by] = l.split('\t'); return { bytes: +size, by: (by || '').replace(/\s+/g, ' ').replace(/ # buildkit$/, '').slice(0, 90) } }).reverse()
  const total = +(sh(`docker image inspect ${tag} --format '{{.Size}}'`, dir).out.trim()) || 0
  const run = sh(`docker run -d --name ${tag}-run ${tag} && sleep 2 && docker ps -s --filter name=${tag}-run --format '{{.Size}}'`, dir)
  sh(`docker rm -f ${tag}-run`, dir)
  sh(`docker rmi -f ${tag}`, dir)
  fs.rmSync(dir, { recursive: true, force: true })
  fs.writeFileSync(path.join(root, 'data/measured.json'), JSON.stringify({ imageBytes: total, layers: hist, containerSize: run.out.trim().split('\n').pop(), scenarios }, null, 2) + '\n')
}

// ---------------------------------------------------------------- shape of the data the pages print
if (fs.existsSync(path.join(root, 'data/measured.json'))) {
  const m = JSON.parse(read('data/measured.json'))
  const code = m.scenarios?.find((s) => s.id === 'code')
  const pkg = m.scenarios?.find((s) => s.id === 'pkg')
  // the lesson's claim about caching is only true if the measurement shows it
  if (code && !(code.steps.find((s) => /npm install/.test(s.text))?.state === 'cached')) bad('measured: editing server.js should leave `npm install` cached')
  if (code && !(code.steps.find((s) => /COPY \. \./.test(s.text))?.state === 'rebuilt')) bad('measured: editing server.js should rebuild `COPY . .`')
  if (pkg && !(pkg.steps.find((s) => /npm install/.test(s.text))?.state === 'rebuilt')) bad('measured: editing package.json should rebuild `npm install`')
}

if (problems.length) { console.error(problems.join('\n')); process.exit(1) }
console.log(`OK: ${pages.length} pages, ${lessons.length} lessons${staticOnly ? ' (static only)' : ' run against Docker'}${update ? ', transcripts and measurements updated' : ''}`)
