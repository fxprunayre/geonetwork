const fs = require('fs');

function sortObj(obj) {
  if (Array.isArray(obj)) return obj.map(sortObj);
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).sort((a, b) => a.localeCompare(b)).reduce((acc, key) => {
      acc[key] = sortObj(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

const files = process.argv.slice(2);
files.forEach(f => {
  try {
    const data = JSON.parse(fs.readFileSync(f, 'utf8'));
    fs.writeFileSync(f, JSON.stringify(sortObj(data), null, 2) + '\n');
    console.log(`Sorted ${f}`);
  } catch (err) {
    console.error(`Error sorting ${f}:`, err);
    process.exit(1);
  }
});
