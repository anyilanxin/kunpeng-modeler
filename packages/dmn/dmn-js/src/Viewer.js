import Manager from '@kunpeng-js/dmn-js-shared/lib/base/Manager';

import DrdViewer from '@kunpeng-js/dmn-js-drd/lib/Viewer';
import DecisionTableViewer from '@kunpeng-js/dmn-js-decision-table/lib/Viewer';
import LiteralExpressionViewer from '@kunpeng-js/dmn-js-literal-expression/lib/Viewer';
import { Viewer as BoxedExpressionViewer } from '@kunpeng-js/dmn-js-boxed-expression';

import { is, getBoxedExpression } from '@kunpeng-js/dmn-js-shared/lib/util/ModelUtil';
import { containsDi } from '@kunpeng-js/dmn-js-shared/lib/util/DiUtil';


/**
 * The dmn viewer.
 */
export default class Viewer extends Manager {

  _getViewProviders() {

    return [
      {
        id: 'drd',
        constructor: DrdViewer,
        opens(element) {
          return is(element, 'dmn:Definitions') && containsDi(element);
        }
      },
      {
        id: 'decisionTable',
        constructor: DecisionTableViewer,
        opens(element) {
          return (
            is(element, 'dmn:Decision') &&
            is(element.decisionLogic, 'dmn:DecisionTable')
          );
        }
      },
      {
        id: 'literalExpression',
        constructor: LiteralExpressionViewer,
        opens(element) {
          return (
            is(element, 'dmn:Decision') &&
            is(element.decisionLogic, 'dmn:LiteralExpression')
          );
        }
      },
      {
        id: 'boxedExpression',
        constructor: BoxedExpressionViewer,
        opens(element) {
          return (
            is(element, 'dmn:BusinessKnowledgeModel') &&
            getBoxedExpression(element)
          );
        }
      }
    ];

  }

}
