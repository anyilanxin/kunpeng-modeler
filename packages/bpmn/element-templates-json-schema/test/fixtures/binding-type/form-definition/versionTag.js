export const template = {
  '$schema': 'https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json',
  'name': 'Form Definition with FormId',
  'id': 'formDefinitionWithFormId',
  'appliesTo': [
    'bpmn:Task'
  ],
  'elementType': {
    'value': 'bpmn:UserTask'
  },
  'properties': [
    {
      'type': 'Hidden',
      'binding': {
        'type': 'kunpeng:userTask',
      }
    },
    {
      'type': 'Hidden',
      'value': 'aFormId',
      'binding': {
        'type': 'kunpeng:formDefinition',
        'property': 'formId'
      }
    },
    {
      'type': 'Hidden',
      'value': 'versionTag',
      'binding': {
        'type': 'kunpeng:formDefinition',
        'property': 'bindingType'
      }
    },
    {
      'type': 'String',
      'value': 'vers-1',
      'binding': {
        'type': 'kunpeng:formDefinition',
        'property': 'versionTag'
      }
    }
  ]
};

export const errors = null;
