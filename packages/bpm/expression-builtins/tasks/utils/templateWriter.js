import { readFile, writeFile } from 'node:fs/promises';

const FEEL_BUILTINS_PLACEHOLDER = '/** FEEL_BUILTINS_PLACEHOLDER */ []';
const CAMUNDA_EXTENSIONS_PLACEHOLDER = '/** CAMUNDA_EXTENSIONS_PLACEHOLDER */ []';
const RESERVED_NAME_BUILTINS_PLACEHOLDER = '/** RESERVED_NAME_BUILTINS_PLACEHOLDER */ []';

/**
 * Write builtins to the destination file using the template
 * @param {string} templatePath
 * @param {string} destinationPath
 * @param {Object} categorized
 * @param {import('@kunpeng/expression-builtins').Builtin[]} categorized.qlexpressionBuiltins
 * @param {import('@kunpeng/expression-builtins').Builtin[]} categorized.kunpengExtensions
 * @param {import('@kunpeng/expression-builtins').Builtin[]} categorized.kunpengReservedNameBuiltins
 */
export async function writeBuiltinsFromTemplate(templatePath, destinationPath, categorized) {
  const { qlexpressionBuiltins, kunpengExtensions, kunpengReservedNameBuiltins } = categorized;

  const template = await readFile(templatePath, 'utf-8');
  let content = template
    .replace(FEEL_BUILTINS_PLACEHOLDER, JSON.stringify(qlexpressionBuiltins, null, 2))
    .replace(CAMUNDA_EXTENSIONS_PLACEHOLDER, JSON.stringify(kunpengExtensions, null, 2))
    .replace(RESERVED_NAME_BUILTINS_PLACEHOLDER, JSON.stringify(kunpengReservedNameBuiltins, null, 2));

  await writeFile(destinationPath, content);
}
