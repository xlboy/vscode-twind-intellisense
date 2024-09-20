import fs from 'fs';
import path from 'path';

const packages = ['@phoenix-twind/intellisense', '@phoenix-twind/preset-tailwind'];

function patchPackage(packageName: string) {
  const packagePath = path.resolve(process.cwd(), '.yalc', packageName, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

  const clone = JSON.parse(JSON.stringify(pkg));

  clone.exports = Object.fromEntries(
    Object.entries(clone.exports).map(([key, value]: [string, any]) => {
      if (typeof value === 'string') {
        return [key, value];
      }
      if (typeof value === 'object' && value !== null) {
        return [
          key,
          {
            types: value.types,
            default: value.development?.default || value.default,
          },
        ];
      }
      return [key, value];
    }),
  );

  fs.writeFileSync(packagePath, JSON.stringify(clone, null, 2));
  console.log(`Patched ${packageName}`);
}

packages.forEach(patchPackage);
