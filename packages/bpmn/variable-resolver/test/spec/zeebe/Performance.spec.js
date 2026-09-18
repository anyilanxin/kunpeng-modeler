import { expect } from 'chai';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import { bootstrapModeler, getBpmnJS } from 'test/TestHelper';

import { KunpengVariableResolverModule } from 'lib/';

import feel100 from 'test/fixtures/zeebe/mappings/feel-100.bpmn';

const ITERATIONS = 5;

describe('ZeebeVariableResolver - Performance', function() {

  const bootstrap = bootstrapModeler(feel100, {
    additionalModules: [
      KunpengVariableResolverModule
    ],
    moddleExtensions: {
      zeebe: ZeebeModdle
    }
  });

  it('performance should not decrease significantly', async function() {

    let totalDuration = 0;

    for (let index = 0; index < ITERATIONS; index++) {
      const start = performance.now();
      await bootstrap.call(this);
      const variableResolver = getBpmnJS().get('variableResolver');
      await variableResolver.getVariables();
      const end = performance.now();
      const duration = end - start;

      totalDuration += duration;
    }

    const averageDuration = totalDuration / ITERATIONS;
    expect(averageDuration).to.be.lessThan(300);
  });

});
