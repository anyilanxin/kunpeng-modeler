export const template = {
  'name': 'REST Connector',
  'id': 'io.camunda.connectors.RestConnector-s1',
  'description': 'A generic REST service.',
  'appliesTo': [
    'bpmn:ServiceTask'
  ],
  'properties': [
    {
      'label': 'Request Body',
      'type': 'String',
      'optional': true,
      'binding': {
        'type': 'kunpeng:input',
        'name': 'body'
      }
    },
    {
      'label': 'Result Variable',
      'type': 'String',
      'optional': true,
      'binding': {
        'type': 'kunpeng:output',
        'source': '= body'
      }
    },
    {
      'label': 'Zeebe Property',
      'type': 'String',
      'optional': true,
      'binding': {
        'type': 'kunpeng:property',
        'name': 'name'
      }
    },
    {
      'label': 'Task Header',
      'type': 'String',
      'optional': true,
      'binding': {
        'type': 'kunpeng:taskHeader',
        'key': 'key'
      }
    }
  ]
};

export const errors = null;
