import standaloneCode from 'ajv/dist/standalone/index.js';
import { writeFileSync as writeFile, mkdirSync as mkdir } from 'fs';
import { resolve, dirname } from 'path';

import validateKunpeng, { ajv as zeebeAjv } from '../src/validateKunpeng.js';


export function createStandaloneKunpengValidator() {
  const code = standaloneCode(zeebeAjv, validateKunpeng);
  const filePath = resolve('tmp', 'standaloneKunpengValidator.js');

  try {
    mkdir(dirname(filePath));
  } catch (err) {

    // ignore; directory may already exist
  }

  writeFile(filePath, code);

  return filePath;
}
