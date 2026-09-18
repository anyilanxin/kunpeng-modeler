import LiteralExpressionPropertiesEditor from './LiteralExpressionPropertiesEditor';
import DebounceInput from '@kunpeng/dmn-js-shared/lib/features/debounce-input';
import Keyboard from '../keyboard';
import DataTypesModule from '@kunpeng/dmn-js-shared/lib/features/data-types';
import ExpressionLanguagesModule from '@kunpeng/dmn-js-shared/lib/features/expression-languages';
import FeelLanguageContextModule from '@kunpeng/dmn-js-shared/lib/features/feel-language-context';

export default {
  __depends__: [
    DebounceInput,
    Keyboard,
    ExpressionLanguagesModule,
    FeelLanguageContextModule,
    DataTypesModule
  ],
  __init__: [ 'literalExpressionProperties' ],
  literalExpressionProperties: [ 'type', LiteralExpressionPropertiesEditor ]
};
