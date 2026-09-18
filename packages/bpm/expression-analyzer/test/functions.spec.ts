import { expect } from 'chai';

import { FeelAnalyzer } from '../src/feel-analyzer';

describe('functions', function () {

  let analyzer: FeelAnalyzer;
  let camundaAnalyzer: FeelAnalyzer;

  beforeEach(function () {
    analyzer = new FeelAnalyzer();
    camundaAnalyzer = new FeelAnalyzer({
      parserDialect: 'camunda',
      builtins: [
        { name: 'sum' },
        { name: 'count' },
        { name: 'contains' },
        { name: 'from json' },
        { name: 'get or else' },
        { name: 'string length' },
      ],
      reservedNameBuiltins: [
        { name: 'from json' },
        { name: 'get or else' },
        { name: 'string length' },
      ],
    });
  });


  it('should extract a single function call', function () {

    // when
    const result = analyzer.analyzeExpression('sum(x)');

    // then
    expect(result.functions).to.deep.equal([
      { name: 'sum', type: 'user', from: 0, to: 3 },
    ]);
  });


  it('should extract nested function calls', function () {

    // when
    const result = analyzer.analyzeExpression('sum(count(x))');

    // then
    expect(result.functions).to.deep.equal([
      { name: 'sum', type: 'user', from: 0, to: 3 },
      { name: 'count', type: 'user', from: 4, to: 9 },
    ]);
  });


  it('should return empty array for expressions without function calls', function () {

    // when
    const result = analyzer.analyzeExpression('x + y');

    // then
    expect(result.functions).to.deep.equal([]);
  });


  it('should return one entry per invocation (no deduplication)', function () {

    // when
    const result = analyzer.analyzeExpression('sum(a) + sum(b)');

    // then
    expect(result.functions).to.deep.equal([
      { name: 'sum', type: 'user', from: 0, to: 3 },
      { name: 'sum', type: 'user', from: 9, to: 12 },
    ]);
  });


  it('should extract functions from complex expressions', function () {

    // when
    const result = analyzer.analyzeExpression('if contains(x, "a") then sum(y) else count(z)');

    // then
    expect(result.functions).to.deep.equal([
      { name: 'contains', type: 'user', from: 3, to: 11 },
      { name: 'sum', type: 'user', from: 25, to: 28 },
      { name: 'count', type: 'user', from: 37, to: 42 },
    ]);
  });


  it('should extract functions inside for expressions', function () {

    // when
    const result = analyzer.analyzeExpression('for i in list return sum(i)');

    // then
    expect(result.functions).to.deep.equal([
      { name: 'sum', type: 'user', from: 21, to: 24 },
    ]);
  });


  it('should extract functions inside filter expressions', function () {

    // when
    const result = analyzer.analyzeExpression('items[contains(name, "a")]');

    // then
    expect(result.functions).to.deep.equal([
      { name: 'contains', type: 'user', from: 6, to: 14 },
    ]);
  });


  describe('camunda dialect', function () {

    it('should extract multi-word function calls', function () {

      // when
      const result = camundaAnalyzer.analyzeExpression('from json(x)');

      // then
      expect(result.functions).to.deep.equal([
        { name: 'from json', type: 'builtin', from: 0, to: 9 },
      ]);
    });


    it('should extract mixed single and multi-word functions', function () {

      // when
      const result = camundaAnalyzer.analyzeExpression('from json(sum(x))');

      // then
      expect(result.functions).to.deep.equal([
        { name: 'from json', type: 'builtin', from: 0, to: 9 },
        { name: 'sum', type: 'builtin', from: 10, to: 13 },
      ]);
    });


    it('should extract multiple multi-word functions', function () {

      // when
      const result = camundaAnalyzer.analyzeExpression('get or else(from json(x), "default")');

      // then
      expect(result.functions).to.deep.equal([
        { name: 'get or else', type: 'builtin', from: 0, to: 11 },
        { name: 'from json', type: 'builtin', from: 12, to: 21 },
      ]);
    });


    it('should mark user-defined functions alongside builtins', function () {

      // when
      const result = camundaAnalyzer.analyzeExpression('sum(myHelper(x))');

      // then
      expect(result.functions).to.deep.equal([
        { name: 'sum', type: 'builtin', from: 0, to: 3 },
        { name: 'myHelper', type: 'user', from: 4, to: 12 },
      ]);
    });


    it('should include backtick delimiters in position span for backtick-quoted names', function () {

      // when
      const expression = '`my func`(x)';
      const result = camundaAnalyzer.analyzeExpression(expression);
      const [ invocation ] = result.functions!;

      // then
      expect(invocation.name).to.equal('my func');
      expect(expression.substring(invocation.from, invocation.to)).to.equal('`my func`');
    });
  });


  describe('shadowing', function () {

    let shadowingAnalyzer: FeelAnalyzer;

    beforeEach(function () {
      shadowingAnalyzer = new FeelAnalyzer({
        builtins: [ { name: 'sum' } ],
      });
    });


    it('should mark builtin shadowed by function parameter as user', function () {

      // when
      const result = shadowingAnalyzer.analyzeExpression('function(sum) sum(5)');

      // then
      expect(result.functions).to.deep.equal([
        { name: 'sum', type: 'user', from: 14, to: 17 },
      ]);
    });


    it('should mark builtin shadowed by context entry as user', function () {

      // when
      const result = shadowingAnalyzer.analyzeExpression('{sum: function(x) x + 1, result: sum(5)}');

      // then
      expect(result.functions).to.deep.equal([
        { name: 'sum', type: 'user', from: 33, to: 36 },
      ]);
    });


    it('should mark builtin shadowed by for iterator as user', function () {

      // when
      const result = shadowingAnalyzer.analyzeExpression('for sum in [function(x) x] return sum(5)');

      // then
      expect(result.functions).to.deep.equal([
        { name: 'sum', type: 'user', from: 34, to: 37 },
      ]);
    });


    it('should mark builtin shadowed by some quantifier as user', function () {

      // when
      const result = shadowingAnalyzer.analyzeExpression('some sum in [function(x) x] satisfies sum(5) = 5');

      // then
      expect(result.functions).to.deep.equal([
        { name: 'sum', type: 'user', from: 38, to: 41 },
      ]);
    });


    it('should mark builtin shadowed by every quantifier as user', function () {

      // when
      const result = shadowingAnalyzer.analyzeExpression('every sum in [function(x) x] satisfies sum(5) = 5');

      // then
      expect(result.functions).to.deep.equal([
        { name: 'sum', type: 'user', from: 39, to: 42 },
      ]);
    });


    it('should type each invocation by the scope at its own position', function () {

      // when
      const result = shadowingAnalyzer.analyzeExpression('sum(x) + {sum: function(y) y, r: sum(z)}.r');

      // then
      expect(result.functions).to.deep.equal([
        { name: 'sum', type: 'builtin', from: 0, to: 3 },
        { name: 'sum', type: 'user', from: 33, to: 36 },
      ]);
    });


    it('should NOT upgrade builtin to user when name is shadowed as entry key', function () {

      // when
      const result = shadowingAnalyzer.analyzeExpression('{ sum: sum(z) }');

      // then
      expect(result.functions).to.deep.equal([
        { name: 'sum', type: 'builtin', from: 7, to: 10 },
      ]);
    });


    it('should NOT upgrade builtin to user when name is shadowed as entry key (grandchild)', function () {

      // when
      const result = shadowingAnalyzer.analyzeExpression('{ sum: { child: { test: sum(z) } } }');

      // then
      expect(result.functions).to.deep.equal([
        { name: 'sum', type: 'builtin', from: 24, to: 27 },
      ]);
    });


    it('should type invocations independently regardless of order', function () {

      // when
      const result = shadowingAnalyzer.analyzeExpression('{sum: function(y) y, r: sum(z)}.r + sum(x)');

      // then
      expect(result.functions).to.deep.equal([
        { name: 'sum', type: 'user', from: 24, to: 27 },
        { name: 'sum', type: 'builtin', from: 36, to: 39 },
      ]);
    });
  });
});
