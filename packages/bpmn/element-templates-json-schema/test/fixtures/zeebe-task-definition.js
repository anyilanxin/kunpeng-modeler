export const template = {
  'name': 'InvalidZeebeTaskHeaderType',
  'id': 'com.camunda.example.InvalidZeebeTaskHeaderType',
  'appliesTo': [
    'bpmn:Task'
  ],
  'properties': [
    {
      'label': 'foo',
      'type': 'Text',
      'binding': {
        'type': 'kunpeng:taskDefinition',
        'property': 'retries'
      }
    },
    {
      'label': 'bar',
      'type': 'String',
      'binding': {
        'type': 'kunpeng:taskDefinition',
        'property': 'type'
      }
    }
  ]
};

export const errors = null;
