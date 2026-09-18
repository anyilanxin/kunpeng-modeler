import { expect } from 'chai';

import { FeelAnalyzer } from '../src/feel-analyzer';

describe('FeelAnalyzer', function () {
  let analyzer: FeelAnalyzer;
  let camundaAnalyzer: FeelAnalyzer;

  beforeEach(function () {
    analyzer = new FeelAnalyzer();
    camundaAnalyzer = new FeelAnalyzer({
      parserDialect: 'camunda',
      reservedNameBuiltins: [{ name: 'get or else' }],
    });

  });


  describe('feelAnalyzer', function () {

    it('should parse valid expression', function () {
      const result = analyzer.analyzeExpression('a + b');
      expect(result.valid).to.be.true;
    });


    it('should detect invalid expression', function () {
      const result = analyzer.analyzeExpression('a + ');
      expect(result.valid).to.be.false;
    });


    it('should not parse camunda reserved name builtins', function () {

      const result = analyzer.analyzeExpression('get or else(a, b)');
      expect(result.valid).to.be.false;
    });
  });


  describe('camundaAnalyzer', function () {

    it('should parse camunda reserved name builtins', function () {
      const result = camundaAnalyzer.analyzeExpression('get or else(a, b)');
      expect(result.valid).to.be.true;
    });


    it('should support backticks', function () {
      const result = camundaAnalyzer.analyzeExpression('`backtick`');
      expect(result.valid).to.be.true;
      expect(result.inputs).to.deep.equal([{ name: 'backtick' }]);
    });

    it('should detect syntax errors nested in all relevant branches', function () {
      [
        '=...',
        'sum(=...)',
        'a[=...]',
        '{a: =...}',
        'for x in =... return x',
        'some x in =... satisfies x > 1',
        'function(a) =...',
      ].forEach((expression) => {
        const result = camundaAnalyzer.analyzeExpression(expression);

        expect(result.valid, `expected expression to be invalid: ${ expression }`).to.be.false;
      });
    });

  });


  describe('analyzeTree', function () {

    it('should analyze an already-parsed tree', function () {

      // given
      const expression = 'from json("x") + b';
      const tree = analyzer.parser.parse(expression);

      // when
      const result = analyzer.analyzeTree(tree, expression);

      // then
      expect(result).to.deep.equal({
        valid: true,
        inputs: [ { name: 'b' }, { name: 'from json' } ],
        functions: [ { name: 'from json', type: 'user', from: 0, to: 9 } ],
      });
    });

  });
});
