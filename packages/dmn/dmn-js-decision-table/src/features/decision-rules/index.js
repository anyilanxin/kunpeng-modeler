import ExpressionLanguagesModule from '@kunpeng-js/dmn-js-shared/lib/features/expression-languages';
import FeelLanguageContextModule from '@kunpeng-js/dmn-js-shared/lib/features/feel-language-context';

import DecisionRules from './DecisionRules';


export default {
  __depends__: [
    ExpressionLanguagesModule,
    FeelLanguageContextModule
  ],
  __init__: [ 'decisionRules' ],
  decisionRules: [ 'type', DecisionRules ]
};
