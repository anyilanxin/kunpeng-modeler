import { expect } from 'chai';

import { parseBuiltin } from '../../../../tasks/utils/parseBuiltins.js';


describe('tasks/parseBuiltins', function() {

  it('should parse parameters correctly', function() {

    // given
    const descriptor = {
      name: 'get or else(value, default)',
      description:
        '<p><em>Camunda Extension</em></p>\n<p>Return the provided value parameter if not <code>null</code>, otherwise return the default parameter</p>\n<p><strong>Function signature</strong></p>\n<pre><code class="language-feel">get or else(value: Any, default: Any): Any\n</code></pre>\n<p><strong>Examples</strong></p>\n<pre><code class="language-feel">get or else(&quot;this&quot;, &quot;default&quot;)\n// &quot;this&quot;\n\nget or else(null, &quot;default&quot;)\n// &quot;default&quot;\n\nget or else(null, null)\n// null\n</code></pre>\n',
    };

    // when
    const builtin = parseBuiltin(descriptor);

    // then
    expect(builtin).to.eql({
      name: 'get or else',
      info: descriptor.description,
      type: 'function',
      params: [
        {
          name: 'value',
        },
        {
          name: 'default',
        },
      ],
      engines: { camunda: '>=8.3' }
    });
  });


  it('should parse parameterless functions', function() {

    // given
    const descriptor = {
      name: 'random number()',
      description:
        '<p><em>Camunda Extension</em></p>\n<p>Returns a random number between <code>0</code> and <code>1</code>.</p>\n<p><strong>Function signature</strong></p>\n<pre><code class="language-feel">random number(): number\n</code></pre>\n<p><strong>Examples</strong></p>\n<pre><code class="language-feel">random number()\n// 0.9701618132579795\n</code></pre>\n',
    };

    // when
    const builtin = parseBuiltin(descriptor);

    // then
    expect(builtin).to.eql({
      name: 'random number',
      info: descriptor.description,
      type: 'function',
      params: [],
      engines: { camunda: '>=8.2' }
    });
  });


  it('should not include engines for unversioned function', function() {

    // given
    const descriptor = {
      name: 'not(negand)',
      description: '<p>Returns the logical negation of the given value.</p>',
    };

    // when
    const builtin = parseBuiltin(descriptor);

    // then
    expect(builtin).to.not.have.property('engines');
  });

});
