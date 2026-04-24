#!/usr/bin/env bun

// scripts/release.ts — 版本发布脚本
// 用法: bun run scripts/release.ts [patch|minor|major]
// 默认: patch

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { $ } from 'bun'

const semver = process.argv[2] || 'patch'
const validSemver = ['patch', 'minor', 'major']
if (!validSemver.includes(semver)) {
  console.error(`[release] Invalid semver: "${semver}". Must be one of: ${validSemver.join(', ')}`)
  process.exit(1)
}

const rootDir = import.meta.dir.replace(/[/\\]scripts$/, '')
const rootPkgPath = join(rootDir, 'package.json')

function readPkg(path: string) {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writePkg(path: string, pkg: Record<string, unknown>) {
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`)
}

function bumpVersion(version: string, level: string): string {
  const parts = version.split('.').map(Number)
  switch (level) {
    case 'major':
      return `${parts[0] + 1}.0.0`
    case 'minor':
      return `${parts[0]}.${parts[1] + 1}.0`
    default:
      return `${parts[0]}.${parts[1]}.${parts[2] + 1}`
  }
}

async function main() {
  console.log(`\n🚀 xAgent Release — ${semver}\n`)

  // 1. 前置检查
  console.log('[1/7] Running pre-release checks...')

  const lintResult = await $`bun run lint`.nothrow()
  if (lintResult.exitCode !== 0) {
    console.error('[release] Lint failed. Please fix lint errors before releasing.')
    process.exit(1)
  }

  const checkResult = await $`bun run check`.nothrow()
  if (checkResult.exitCode !== 0) {
    console.error('[release] Type check failed. Please fix type errors before releasing.')
    process.exit(1)
  }
  console.log('       ✓ Lint & type check passed')

  // 2. 确认工作区干净
  console.log('[2/7] Checking working tree...')
  const statusResult = await $`git status --porcelain`.nothrow()
  if (statusResult.stdout.toString().trim()) {
    console.error('[release] Working tree is not clean. Please commit or stash changes first.')
    process.exit(1)
  }
  console.log('       ✓ Working tree clean')

  // 3. 确保在 main 分支
  console.log('[3/7] Checking branch...')
  const branchResult = await $`git branch --show-current`.nothrow()
  const branch = branchResult.stdout.toString().trim()
  if (branch !== 'main' && branch !== 'master') {
    console.warn(`[release] Warning: not on main/master (current: "${branch}"). Continue anyway?`)
  } else {
    console.log(`       ✓ On ${branch}`)
  }

  // 4. 拉取最新代码
  console.log('[4/7] Pulling latest changes...')
  await $`git pull --ff-only`.nothrow()
  console.log('       ✓ Up to date')

  // 5. 构建
  console.log('[5/7] Building all packages...')
  const buildResult = await $`bun run build`
  if (buildResult.exitCode !== 0) {
    console.error('[release] Build failed.')
    process.exit(1)
  }
  console.log('       ✓ Build successful')

  // 6. 版本号升级（同步所有包）
  console.log('[6/7] Bumping versions...')
  const rootPkg = readPkg(rootPkgPath)
  const oldVersion = rootPkg.version as string
  const newVersion = bumpVersion(oldVersion, semver)
  console.log(`       ${oldVersion} → ${newVersion}`)

  // 更新所有包的版本号
  const pkgDirs = ['packages/core', 'packages/shared', 'packages/terminal', 'packages/web']

  for (const dir of pkgDirs) {
    const pkgPath = join(rootDir, dir, 'package.json')
    const pkg = readPkg(pkgPath)
    pkg.version = newVersion
    writePkg(pkgPath, pkg)
  }

  // 更新 root
  rootPkg.version = newVersion
  writePkg(rootPkgPath, rootPkg)

  console.log('       ✓ All package versions updated')

  // 7. Git 提交 & 标签
  console.log('[7/7] Creating release commit & tag...')
  await $`git add -A`
  await $`git commit -m "release: v${newVersion}"`
  await $`git tag -a "v${newVersion}" -m "v${newVersion}"`

  console.log(`\n✅ Release v${newVersion} ready!\n`)
  console.log('Next steps:')
  console.log(`  git push origin ${branch || 'main'} --tags`)
  console.log('  npm publish (if publishing to registry)')
  console.log('  Deploy web/ to hosting (see SPEC.md §13)\n')
}

main().catch((err) => {
  console.error('[release] Fatal error:', err)
  process.exit(1)
})
