import { cmQlexpressionLinter } from '@kunpeng/expression-lint';
import { linter } from '@codemirror/lint';

export default [ linter(cmQlexpressionLinter()) ];
