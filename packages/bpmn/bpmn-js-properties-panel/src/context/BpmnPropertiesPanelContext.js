import {
  createContext
} from '@kunpeng-js/properties-panel/preact';

const BpmnPropertiesPanelContext = createContext({
  selectedElement: null,
  injector: null,
  getService() { return null; }
});

export default BpmnPropertiesPanelContext;