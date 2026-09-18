import { marked } from 'marked';
import { readFile } from 'node:fs/promises';

/**
 * @typedef { { name: string, description: string } } BuiltinDescriptor
 */

/**
 * Parse a markdown file to extract builtin function descriptors
 * @param {string} fileName
 * @return {Promise<BuiltinDescriptor[]>}
 */
export async function parseMarkdownFile(fileName) {
  const fileContent = await readFile(fileName, 'utf-8');

  const [ _heading, ...contents ] = fileContent.split('## ');

  const descriptions = await Promise.all(
    contents.flatMap(async (string) => {
      const name = string.split('\n')[0];
      let description = await Promise.resolve(marked.parse(string.split('\n').slice(1).join('\n')));

      description = description.replace('<MarkerCamundaExtension></MarkerCamundaExtension>', '<em>Camunda Extension</em>');

      // e.g. "and() / all()"
      if (name.includes('/')) {
        throw new Error(`unsupported built-in name <${name}>`);
      }

      return { name, description };
    }),
  );

  return descriptions;
}
