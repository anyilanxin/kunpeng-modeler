import { isInput, isOutput } from '@kunpeng/dmn-js-shared/lib/util/ModelUtil';

import InputNumberEdit from './components/InputNumberEdit';
import OutputNumberEdit from './components/OutputNumberEdit';

export default class SimpleNumberEdit {
  constructor(components, simpleMode) {
    simpleMode.registerProvider((element) => {
      const typeRef = getTypeRef(element);

      return (
        (isInput(element.col) || isOutput(element.col)) && isNumber(typeRef)
      );
    });

    components.onGetComponent('context-menu', (context = {}) => {
      if (
        context.contextMenuType &&
        context.contextMenuType === 'simple-mode-edit'
      ) {
        if (!context.element) {
          return;
        }

        const typeRef = getTypeRef(context.element);

        if (isNumber(typeRef)) {
          if (isInput(context.element.col)) {
            return InputNumberEdit;
          } else if (isOutput(context.element.col)) {
            return OutputNumberEdit;
          }
        }
      }
    });
  }
}

SimpleNumberEdit.$inject = ['components', 'simpleMode'];

// helpers //////////////////////

function getTypeRef(element) {
  return isInput(element.col)
    ? element.col && element.col.businessObject.inputExpression.typeRef
    : element.col && element.col.businessObject.typeRef;
}

const numberTypes = new Set(['double', 'integer', 'long', 'number']);

function isNumber(typeRef) {
  return numberTypes.has(typeRef);
}
