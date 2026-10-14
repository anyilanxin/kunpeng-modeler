import { cmQlexpressionLinter } from '@kunpeng-js/expression-lint';
import { linter } from '@codemirror/lint';

export default [ linter(cmQlexpressionLinter()) ];
