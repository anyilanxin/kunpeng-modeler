import { expect } from 'chai';
import { FeelAnalyzer } from '../src/feel-analyzer';

import { testCases } from './fixtures/basic-examples';

describe('Test Cases from playground', function() {
  let analyzer: FeelAnalyzer;

  beforeEach(function() {
    analyzer = new FeelAnalyzer();
  });

  testCases.forEach((testCase, index) => {
    it(`#${index + 1}: ${testCase.description}`, function() {
      // given
      const { expression, expected } = testCase;

      // when
      const result = analyzer.analyzeExpression(expression);

      // then
      expect(result.valid).to.be.true;
      if (expected?.inputs !== undefined) {
        expect(result.inputs).to.deep.equal(
          expected.inputs,
          `inputs mismatch for: ${expression}`
        );
      }
    });
  });
});
