import KunpengVariableResolver from './VariableResolver';
import VariableProvider from './VariableProvider';
import ConnectorVariableProvider from './extractors/connectors';

export const KunpengVariableResolverModule = {
  __init__: [
    'variableResolver',
    'connectorVariableProvider'
  ],
  variableResolver: [ 'type', KunpengVariableResolver ],
  connectorVariableProvider: [ 'type', ConnectorVariableProvider ]
};

export { VariableProvider };
