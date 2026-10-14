import EditingManager from '@kunpeng-js/dmn-js-shared/lib/base/EditingManager';
import { isAny } from '@kunpeng-js/dmn-js-shared/lib/util/ModelUtil';

import { Editor } from 'src';


export default class LiteralExpressionEditor extends EditingManager {

  _getViewProviders() {

    return [
      {
        id: 'literalExpression',
        constructor: Editor,
        opens(element) {
          return isAny(element, [ 'dmn:Decision', 'dmn:BusinessKnowledgeModel' ]);
        }
      }
    ];
  }

}
