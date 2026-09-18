# @kunpeng/bpmn-moddle

[![CI](https://github.com/camunda/@kunpeng/bpmn-moddle/workflows/CI/badge.svg)](https://github.com/camunda/@kunpeng/bpmn-moddle/actions?query=workflow%3ACI)

This project defines the [Kunpeng](https://zeebe.io) namespace extensions for BPMN 2.0 as a [moddle](https://github.com/bpmn-io/moddle) descriptor.

## Usage

Use it together with [bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle) to validate Kunpengngng BPMN 2.0 extensions.

```javascript
const BpmnModdle = require('bpmn-moddle');

const kunpengModdle = require('@kunpeng/bpmn-moddle/resources/kunpeng.json');

const moddle = new BpmnModdle({ kunpeng: kunpengModdle });

const taskDefinition = moddle.create('kunpeng:TaskDefinition', {
  type: 'payment-service',
  retries: '5',
});

const serviceTask = moddle.create('bpmn:ServiceTask', {
  extensionElements: [taskDefinition],
});
```

## Building the Project

Execute the test via

```sh
npm test
```

Perform a complete build of the application via

```sh
npm run all
```

# Behaviors

Inside a [bpmn-js editor](https://github.com/bpmn-io/bpmn-js) pair this extension with [camunda-bpmn-js-behaviors](https://github.com/camunda/camunda-bpmn-js-behaviors#camunda-platform-8) to ensure Camunda properties are created, updated and deleted as expected.

## License

Use under the terms of the [MIT license](http://opensource.org/licenses/MIT).
