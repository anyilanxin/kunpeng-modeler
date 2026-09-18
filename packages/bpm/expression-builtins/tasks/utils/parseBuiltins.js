import { enginesByFunction } from '../engines.js';

/**
 * @param { import('./markdownParser.js').BuiltinDescriptor[] } descriptors
 *
 * @returns {import('@kunpeng/expression-builtins').Builtin[] }
 */
export function parseBuiltins(descriptors) {
  return descriptors.map(parseBuiltin);
}

/**
 * @param { import('./markdownParser.js').BuiltinDescriptor } descriptor
 *
 * @returns { import('@kunpeng/expression-builtins').Builtin }
 */
export function parseBuiltin(descriptor) {

  const {
    name,
    description
  } = descriptor;

  const match = name.match(/^([\w\s]+)\((.*)\)$/);

  if (!match) {
    throw new Error(`failed to parse <${name}>`);
  }

  const functionName = match[1];
  const functionArguments = match[2];

  // parameterless function matches as empty string
  const params = functionArguments ? functionArguments.split(', ').map(name => ({ name })) : [];

  const engines = enginesByFunction[functionName];

  return {
    name: functionName,
    type: 'function',
    params,
    info: description,
    ...engines && { engines }
  };
}

