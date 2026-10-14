import ExpressionLanguagesModule from '@kunpeng-js/dmn-js-shared/lib/features/expression-languages';

import ExpressionLanguage from './ExpressionLanguage';

export default {
  __depends__: [
    ExpressionLanguagesModule
  ],
  __init__: [ 'expressionLanguage' ],
  expressionLanguage: [ 'type', ExpressionLanguage ]
};
