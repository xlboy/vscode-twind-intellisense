import pkg from '../.yalc/@phoenix-twind/intellisense/package.json';
import fs from 'fs';

const clone = JSON.parse(JSON.stringify(pkg));

clone.exports = {
  '.': {
    types: './intellisense.d.ts',
    default: './intellisense.dev.js',
  },
  './package.json': './package.json',
};

fs.writeFileSync('./.yalc/@phoenix-twind/intellisense/package.json', JSON.stringify(clone, null, 2));
