import { expect } from 'chai';

import { FeelAnalyzer } from '@kunpeng/expression-analyzer';

describe('expression-analyzer - use from package', function() {

  it('should expose FeelAnalyzer', function() {

    // when
    const analyzer = new FeelAnalyzer();
    const result = analyzer.analyzeExpression('a + b');

    // then
    expect(result).to.have.property('inputs');
  });

});
