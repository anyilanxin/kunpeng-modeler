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
      type: 'Hidden',
      value: 'someDefaultUser, someOtherUser',
      binding: {
        type: 'kunpeng:assignmentDefinition',
        property: 'candidateUsers'
      }
    }
  ]
};

export const errors = null;
