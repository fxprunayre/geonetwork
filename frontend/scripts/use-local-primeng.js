#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

function log(msg) {
  process.stdout.write(`[use-local-primeng] ${msg}\n`);
}

function fail(msg) {
  process.stderr.write(`[use-local-primeng] ERROR: ${msg}\n`);
  process.exit(1);
}

function run(cmd, cwd) {
  log(`$ ${cmd}`);
  cp.execSync(cmd, { cwd, stdio: 'inherit' });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function replaceCatalogVersion(version, fallback) {
  if (typeof version !== 'string') return version;
  if (version.startsWith('catalog:')) return fallback;
  return version;
}

function sanitizePrimengPackageJson(packageJsonPath) {
  const pkg = readJson(packageJsonPath);
  let changed = false;

  const angularRange = '^21.0.0';

  if (pkg.peerDependencies) {
    const peerKeys = [
      '@angular/cdk',
      '@angular/common',
      '@angular/core',
      '@angular/forms',
      '@angular/router',
      '@angular/platform-browser',
    ];

    for (const key of peerKeys) {
      if (pkg.peerDependencies[key]) {
        const next = replaceCatalogVersion(pkg.peerDependencies[key], angularRange);
        if (next !== pkg.peerDependencies[key]) {
          pkg.peerDependencies[key] = next;
          changed = true;
        }
      }
    }
  }

  if (pkg.dependencies) {
    const primeUiFallbacks = {
      '@primeuix/styled': '^0.7.0',
      '@primeuix/utils': '^0.6.0',
      '@primeuix/styles': '^2.0.0',
      '@primeuix/motion': '^0.0.10',
    };

    for (const [key, fallback] of Object.entries(primeUiFallbacks)) {
      if (pkg.dependencies[key]) {
        const next = replaceCatalogVersion(pkg.dependencies[key], fallback);
        if (next !== pkg.dependencies[key]) {
          pkg.dependencies[key] = next;
          changed = true;
        }
      }
    }
  }

  if (changed) {
    writeJson(packageJsonPath, pkg);
    log(`Sanitized catalog: versions in ${packageJsonPath}`);
  } else {
    log('No catalog: versions to sanitize in primeng dist package.json');
  }

  return pkg;
}

function findLatestTarball(dir, version) {
  const files = fs.readdirSync(dir);
  const matcher = new RegExp(`^primeng-${version.replace(/\./g, '\\.')}.*\\.tgz$`);
  const tgzs = files
    .filter((f) => matcher.test(f))
    .map((f) => ({
      file: f,
      mtime: fs.statSync(path.join(dir, f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  return tgzs[0]?.file;
}

function cleanupLocalTarballs(dir, version, keepFile) {
  const files = fs.readdirSync(dir);
  const matcher = new RegExp(`^primeng-${version.replace(/\./g, '\\.')}-local-\\d+\\.tgz$`);

  for (const file of files) {
    if (file === keepFile) continue;
    if (matcher.test(file)) {
      fs.unlinkSync(path.join(dir, file));
      log(`Removed previous local tarball: ${file}`);
    }
  }
}

function updateFrontendPackage(frontendPackageJsonPath, tarballAbsPath) {
  const frontendPkg = readJson(frontendPackageJsonPath);
  if (!frontendPkg.dependencies) {
    frontendPkg.dependencies = {};
  }

  const frontendDir = path.dirname(frontendPackageJsonPath);
  const rel = path.relative(frontendDir, tarballAbsPath).replace(/\\/g, '/');
  frontendPkg.dependencies.primeng = `file:${rel}`;

  writeJson(frontendPackageJsonPath, frontendPkg);
  log(`Updated primeng dependency to file:${rel}`);
}

function main() {
  const frontendRoot = path.resolve(__dirname, '..');
  const primengDist = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.resolve(frontendRoot, '../../../primeng/packages/primeng/dist');

  const primengPkgJsonPath = path.join(primengDist, 'package.json');
  const frontendPkgJsonPath = path.join(frontendRoot, 'package.json');

  if (!fs.existsSync(primengDist)) {
    fail(`PrimeNG dist directory not found: ${primengDist}`);
  }

  if (!fs.existsSync(primengPkgJsonPath)) {
    fail(`Missing package.json in PrimeNG dist directory: ${primengPkgJsonPath}`);
  }

  log(`Using PrimeNG dist: ${primengDist}`);

  const primengPkg = sanitizePrimengPackageJson(primengPkgJsonPath);
  const version = primengPkg.version;

  if (!version) {
    fail('PrimeNG dist package.json has no version field');
  }

  const existing = findLatestTarball(primengDist, version);
  if (existing) {
    const existingPath = path.join(primengDist, existing);
    fs.unlinkSync(existingPath);
    log(`Removed previous tarball: ${existing}`);
  }

  run('npm pack', primengDist);

  const packedTarball = findLatestTarball(primengDist, version);
  if (!packedTarball) {
    fail(`Could not find tarball after npm pack in ${primengDist}`);
  }

  const uniqueTarball = `primeng-${version}-local-${Date.now()}.tgz`;
  const packedTarballPath = path.join(primengDist, packedTarball);
  const uniqueTarballPath = path.join(primengDist, uniqueTarball);

  fs.renameSync(packedTarballPath, uniqueTarballPath);
  cleanupLocalTarballs(primengDist, version, uniqueTarball);

  log(`Packed tarball: ${uniqueTarballPath}`);

  updateFrontendPackage(frontendPkgJsonPath, uniqueTarballPath);

  run('./node/npm install', frontendRoot);
  log('Done. Local PrimeNG tarball is now wired into this frontend workspace.');
}

main();
