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
      'type': 'Dropdown',
      'label': 'Binding',
      'id': 'bindingType',
      'binding': {
        'type': 'kunpeng:formDefinition',
        'property': 'bindingType'
      },
      'choices': [
        {
          'name': 'Latest',
          'value': 'latest'
        },
        {
          'name': 'Deployment',
          'value': 'deployment'
        },
        {
          'name': 'Version Tag',
          'value': 'versionTag'
        }
      ],
      'value': 'latest',
    },
    {
      'type': 'String',
      'label': 'Version tag',
      'binding': {
        'type': 'kunpeng:formDefinition',
        'property': 'versionTag'
      },
      'condition': {
        'property': 'bindingType',
        'equals': 'versionTag'
      }
    }
  ]
};

export const errors = null;
