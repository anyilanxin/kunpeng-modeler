# FEEL Analyzer

> A library for analyzing FEEL (Friendly Enough Expression Language) expressions.

[![CI](https://github.com/bpmn-io/feel-analyzer/workflows/CI/badge.svg)](https://github.com/bpmn-io/feel-analyzer/actions?query=workflow%3ACI)

## Installation

```bash
npm install @bpmn-io/feel-analyzer
```

## Usage

To get started, create a `FeelAnalyzer` instance:

```javascript
import { FeelAnalyzer } from '@bpmn-io/feel-analyzer';

const analyzer = new FeelAnalyzer();
```

Analyze a FEEL expression to extract input variables:

```javascript
const result = analyzer.analyzeExpression('x + y');

console.log(result.valid); // true
console.log(result.inputs);
// [
//   { name: 'x' },
//   { name: 'y' }
// ]
```

Configure the FEEL dialect (expression or unary tests):

```javascript
const analyzer = new FeelAnalyzer({
  dialect: 'unaryTests', // defaults to 'expression'
});
```

### Builtins

You can provide `builtins` and `reservedNameBuiltins` to exclude built-in names from input detection. Use [`@camunda/feel-builtins`](https://github.com/camunda/feel-builtins) to supply these:

```javascript
import { FeelAnalyzer } from '@bpmn-io/feel-analyzer';
import { builtins, reservedNameBuiltins } from '@camunda/feel-builtins';

const analyzer = new FeelAnalyzer({
  dialect: 'expression',
  parserDialect: 'camunda',
  builtins,
  reservedNameBuiltins,
});

const result = analyzer.analyzeExpression('sum(orders.amount) > 100');

console.log(result.inputs);
// [
//   {
//     name: 'orders',
//     type: 'List',
//     entries: [
//       { name: 'amount' }
//     ]
//   }
// ]
```

### Input Variables

The analyzer extracts input variables with type information, including nested structures. The data model is aligned with [variable-resolver](https://github.com/bpmn-io/variable-resolver):

```javascript
const result = analyzer.analyzeExpression(
  'person.name = "John" and scores[1] > 10',
);

console.log(result.inputs);
// [
//   {
//     name: 'person',
//     type: 'Context',
//     entries: [
//       { name: 'name' }
//     ]
//   },
//   {
//     name: 'scores',
//     type: 'List'
//   }
// ]
```

### Invoked Functions

The analyzer extracts all function invocations from the expression, sorted by name and deduplicated. Each function is classified as `builtin` or `user` based on the provided `builtins` list:

```javascript
import { FeelAnalyzer } from '@bpmn-io/feel-analyzer';
import {
  camundaBuiltins,
  camundaReservedNameBuiltins,
} from '@camunda/feel-builtins';

const analyzer = new FeelAnalyzer({
  parserDialect: 'camunda',
  builtins: camundaBuiltins,
  reservedNameBuiltins: camundaReservedNameBuiltins,
});

const result = analyzer.analyzeExpression('from json(sum(myHelper(x)))');

console.log(result.functions);
// [
//   { name: 'from json', type: 'builtin' },
//   { name: 'myHelper', type: 'user' },
//   { name: 'sum', type: 'builtin' }
// ]
```

### Analyzing an Already-Parsed Tree

If you already have a parsed syntax tree—for example from a CodeMirror editor using the same parser—you can analyze it directly with `analyzeTree`, avoiding a redundant parse:

```javascript
const analyzer = new FeelAnalyzer();

const expression = 'x + y';
const tree = analyzer.parser.parse(expression);

const result = analyzer.analyzeTree(tree, expression);
```

The tree must come from a parser configured consistently with the analyzer (same `dialect`, `parserDialect`, and `reservedNameBuiltins`) - such as the provided `analyzer.parser`. A tree parsed with a different configuration may yield incorrect results.

## Related

- [@bpmn-io/lezer-feel](https://github.com/bpmn-io/lezer-feel) - FEEL language definition for the [Lezer](https://lezer.codemirror.net/) parser system

## License

MIT
