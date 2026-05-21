const fs = require('fs');
const path = require('path');

const outputDirArg = process.argv[2];
const bundleConfigArg = process.argv[3];

if (!outputDirArg) {
  console.error('Missing output directory argument.');
  process.exit(1);
}

function getBundleName(bundleConfig) {
  if (!bundleConfig) {
    return 'sextant-app.js';
  }

  const bundleConfigPath = path.resolve(process.cwd(), bundleConfig);
  if (fs.existsSync(bundleConfigPath)) {
    const environmentFile = fs.readFileSync(bundleConfigPath, 'utf8');
    const bundleNameMatch = environmentFile.match(/bundleName:\s*['\"]([^'\"]+)['\"]/);

    if (!bundleNameMatch) {
      console.error(`Could not find bundleName in ${bundleConfigPath}`);
      process.exit(1);
    }

    return bundleNameMatch[1].endsWith('.js') ? bundleNameMatch[1] : `${bundleNameMatch[1]}.js`;
  }

  return bundleConfig.endsWith('.js') ? bundleConfig : `${bundleConfig}.js`;
}

const outputDir = path.resolve(process.cwd(), outputDirArg);
const indexPath = path.join(outputDir, 'index.html');

if (!fs.existsSync(outputDir)) {
  console.error(`Output directory does not exist: ${outputDir}`);
  process.exit(1);
}

if (!fs.existsSync(indexPath)) {
  console.error(`index.html not found in output directory: ${outputDir}`);
  process.exit(1);
}

const files = fs.readdirSync(outputDir);
const mainBundleName = files.find((file) => /^main(?:-[A-Z0-9]+)?\.js$/.test(file));

if (!mainBundleName) {
  console.error(`Could not find main bundle in ${outputDir}`);
  process.exit(1);
}

const targetBundleName = getBundleName(bundleConfigArg);

if (mainBundleName !== targetBundleName) {
  fs.renameSync(path.join(outputDir, mainBundleName), path.join(outputDir, targetBundleName));
}

const sourceMapName = `${mainBundleName}.map`;
const targetSourceMapName = `${targetBundleName}.map`;

if (fs.existsSync(path.join(outputDir, sourceMapName)) && sourceMapName !== targetSourceMapName) {
  fs.renameSync(path.join(outputDir, sourceMapName), path.join(outputDir, targetSourceMapName));
}

const indexHtml = fs.readFileSync(indexPath, 'utf8').replace(mainBundleName, targetBundleName);
fs.writeFileSync(indexPath, indexHtml);