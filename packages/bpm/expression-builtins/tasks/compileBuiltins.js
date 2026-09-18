import { glob } from 'glob';
import { categorizeBuiltins, logStatistics, parseBuiltins, parseMarkdownFile, writeBuiltinsFromTemplate } from './utils/index.js';

// paths relative to CWD
const MARKDOWN_SRC = './camunda-docs/docs/components/modeler/feel/builtin-functions/*.md';
const JS_SRC = './tasks/kunpengBuiltins.template.js';
const JS_DEST = './src/kunpengBuiltins.js';

async function run() {
  const files = await glob(MARKDOWN_SRC);

  const descriptors = (await Promise.all(files.sort().map(parseMarkdownFile))).flat();

  const builtins = parseBuiltins(descriptors);

  // Categorize into FEEL builtins and Camunda extensions
  const categorized = categorizeBuiltins(builtins);

  logStatistics(categorized);

  await writeBuiltinsFromTemplate(JS_SRC, JS_DEST, categorized);
}

run().catch((err) => {
  console.error('Failed to compile built-ins', err);

  process.exit(1);
});
