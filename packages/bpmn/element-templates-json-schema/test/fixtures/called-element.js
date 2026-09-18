export const template = {
  '$schema': 'https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json',
  'id': 'io.camunda.examples.Payment',
  'name': 'Payment',
  'description': 'Payment process call activity',
  'appliesTo': [
    'bpmn:Task'
  ],
  'elementType': {
    'value': 'bpmn:CallActivity'
  },
  'properties':[
    {
      'label': 'Payment ID',
      'type': 'String',
      'binding': {
        'type': 'kunpeng:input',
        'name': 'paymentID'
      }
    },
    {
      'type': 'Hidden',
      'value': 'paymentProcess',
      'binding': {
        'type': 'kunpeng:calledElement',
        'property': 'processId'
      }
    }
  ]
};

export const errors = null;
