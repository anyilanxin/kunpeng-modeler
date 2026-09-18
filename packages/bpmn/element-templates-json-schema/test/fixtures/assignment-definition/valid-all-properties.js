export const template = {
  name: 'AssignmentDefinition',
  id: 'com.camunda.example.AssignmentDefinition',
  appliesTo: [
    'bpmn:Task'
  ],
  elementType: {
    value: 'bpmn:UserTask'
  },
  properties: [
    {
      type: 'Hidden',
      binding: {
        type: 'kunpeng:userTask',
      }
    },
    {
      label: 'Assignee',
      description: 'Assignee for user task',
      type: 'String',
      binding: {
        type: 'kunpeng:assignmentDefinition',
        property: 'assignee'
      }
    },
    {
      type: 'Text',
      binding: {
        type: 'kunpeng:assignmentDefinition',
        property: 'candidateUsers'
      }
    },
    {
      type: 'Hidden',
      value: 'someDefaultGroup',
      binding: {
        type: 'kunpeng:assignmentDefinition',
        property: 'candidateGroups'
      }
    }
  ]
};

export const errors = null;
