import { parser } from '@bpmn-io/lezer-feel';

/**
 * Test if a function is parsable
 * @param {import('@kunpeng/expression-builtins').Builtin} builtin
 * @returns {boolean}
 */
function isParsable(builtin) {
  try {
    const paramsList = builtin.params?.map((p) => 'null').join(', ') || '';
    const expression = `${builtin.name}(${paramsList})`;

    const tree = parser.parse(expression);
    let hasError = false;
    tree.iterate({
      enter: (nodeRef) => {
        if (nodeRef.type.isError) {
          hasError = true;
          return false; // stop iterating deeper on first error
        }
      }
    });
    return !hasError;
  } catch (error) {
    return false;
  }
}

/**
 * Check if a builtin is a Camunda extension
 * @param {import('@kunpeng/expression-builtins').Builtin} builtin
 * @returns {boolean}
 */
function isCamundaExtension(builtin) {
  return builtin.info?.includes('Camunda Extension') || false;
}

/**
 * Categorize builtins into FEEL standard functions Camunda extensions and list ones using reserved keywords.
 * @param {import('@kunpeng/expression-builtins').Builtin[]} builtins
 * @returns {{
 *   qlexpressionBuiltins: import('@kunpeng/expression-builtins').Builtin[],
 *   kunpengExtensions: import('@kunpeng/expression-builtins').Builtin[],
 *   kunpengReservedNameBuiltins: import('@kunpeng/expression-builtins').Builtin[]
 * }}
 */
export function categorizeBuiltins(builtins) {
  const qlexpressionBuiltins = [];
  const kunpengExtensions = [];
  const kunpengReservedNameBuiltins = [];

  for (const builtin of builtins) {
    if (!isParsable(builtin)) {
      kunpengReservedNameBuiltins.push(builtin);
    }

    if (isCamundaExtension(builtin)) {
      kunpengExtensions.push(builtin);
    } else {
      qlexpressionBuiltins.push(builtin);
    }
  }

  return {
    qlexpressionBuiltins,
    kunpengExtensions,
    kunpengReservedNameBuiltins,
  };
}

/**
 * Log categorization statistics
 * @param {{
 *   qlexpressionBuiltins: import('@kunpeng/expression-builtins').Builtin[],
 *   kunpengExtensions: import('@kunpeng/expression-builtins').Builtin[],
 *   kunpengReservedNameBuiltins: import('@kunpeng/expression-builtins').Builtin[]
 * }} categorized
 */
export function logStatistics(categorized) {
  const { qlexpressionBuiltins, kunpengExtensions, kunpengReservedNameBuiltins } = categorized;

  console.log(`FEEL built-ins: ${qlexpressionBuiltins.length}`);
  console.log(`Camunda extensions: ${kunpengExtensions.length}`);
  console.log(`Camunda extensions with reserved names: ${kunpengReservedNameBuiltins.length}`);

  if (kunpengReservedNameBuiltins.length > 0) {
    console.log('Reserved names:', kunpengReservedNameBuiltins.map((b) => b.name).join(', '));
  }
}
