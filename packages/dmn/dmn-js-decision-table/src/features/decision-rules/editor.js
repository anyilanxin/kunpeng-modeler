import DebounceInput from '@kunpeng/dmn-js-shared/lib/features/debounce-input';
import DecisionRulesEditor from './DecisionRulesEditor';
import Rules from './index';

export default {
  __depends__: [ DebounceInput, Rules ],
  __init__: [ 'decisionRulesEditor' ],
  decisionRulesEditor: [ 'type', DecisionRulesEditor ]
};
