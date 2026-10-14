import BpmnPropertiesPanelRenderer from './BpmnPropertiesPanelRenderer';

import Commands from '../cmd';
import { DebounceInputModule, ExpressionPopupModule } from '@kunpeng-js/properties-panel';

export default {
  __depends__: [
    Commands,
    DebounceInputModule,
    ExpressionPopupModule
  ],
  __init__: [
    'propertiesPanel'
  ],
  propertiesPanel: [ 'type', BpmnPropertiesPanelRenderer ]
};
