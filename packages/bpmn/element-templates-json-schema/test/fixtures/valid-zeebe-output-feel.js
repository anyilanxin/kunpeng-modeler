export const template = {
  'name': 'ValidZeebeOutputFEEL',
  'id': 'com.camunda.example.ValidZeebeOutputFEEL',
  'appliesTo': [
    'bpmn:Task'
  ],
  'properties': [
    {
      'label': 'booleanValidOptional',
      'type': 'Boolean',
      'binding': {
        'type': 'kunpeng:output',
        'source': 'booleanValidOptional'
      },
      'feel': 'optional'
    },
    {
      'label': 'numberValidOptional',
      'type': 'Number',
      'binding': {
        'type': 'kunpeng:output',
        'source': 'numberValidOptional'
      },
      'feel': 'optional'
    },
    {
      'label': 'booleanValidStatic',
      'type': 'Boolean',
      'binding': {
        'type': 'kunpeng:output',
        'source': 'booleanValidStatic'
      },
      'feel': 'static'
    },
    {
      'label': 'numberValidStatic',
      'type': 'Number',
      'binding': {
        'type': 'kunpeng:output',
        'source': 'numberValidStatic'
      },
      'feel': 'static'
    },
    {
      'label': 'booleanValid',
      'type': 'Boolean',
      'binding': {
        'type': 'kunpeng:output',
        'source': 'booleanValid'
      }
    },
    {
      'label': 'numberValid',
      'type': 'Number',
      'binding': {
        'type': 'kunpeng:output',
        'source': 'numberValid'
      }
    },
    {
      'label': 'booleanValidFeel',
      'type': 'Boolean',
      'binding': {
        'type': 'kunpeng:output',
        'source': 'booleanValidFeel'
      },
      'feel': 'required'
    },
    {
      'label': 'numberValidFeel',
      'type': 'Number',
      'binding': {
        'type': 'kunpeng:output',
        'source': 'numberValidFeel'
      },
      'feel': 'required'
    }
  ]
};

export const errors = null;
