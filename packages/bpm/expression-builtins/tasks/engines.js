/**
 * Manually maintained mapping of `kunpengBuiltins` function names
 * to their minimum supported engine versions.
 *
 * Functions not listed here are assumed to be available in all versions.
 *
 * @type { Record<string, Record<string, string>> }
 */
export const enginesByFunction = {
  'context merge': { camunda: '>=8.2' },
  'last day of month': { camunda: '>=8.2' },
  'random number': { camunda: '>=8.2' },
  'assert': { camunda: '>=8.3' },
  'duplicate values': { camunda: '>=8.3' },
  'get or else': { camunda: '>=8.3' },
  'is empty': { camunda: '>=8.6' },
  'to base64': { camunda: '>=8.6' },
  'trim': { camunda: '>=8.6' },
  'uuid': { camunda: '>=8.6' },
  'is blank': { camunda: '>=8.8' },
  'partition': { camunda: '>=8.7' },
  'fromAi': { camunda: '>=8.8' },
  'from json': { camunda: '>=8.9' },
  'to json': { camunda: '>=8.9' },
};
