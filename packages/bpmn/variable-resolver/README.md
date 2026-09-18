# @kunpeng/variable-resolver

[![CI](https://github.com/bpmn-io/variable-resolver/actions/workflows/CI.yml/badge.svg)](https://github.com/bpmn-io/variable-resolver/actions/workflows/CI.yml)

An extension for [bpmn-js](https://github.com/bpmn-io/bpmn-js) that makes the data model of the diagram available to other components.

> [!NOTE] As of version `v3` this library exposes both written and consumed variables, you can filter them via options.

## Usage

To add the variable resolver to you application, add it to your bpmn-js configuration:

```javascript
import BpmnModeler from 'bpmn-js/lib/Modeler';
import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  ZeebeVariableResolverModule,     // For Camunda 8 diagrams
  // CamundaVariableResolverModule // for Camunda 7 diagrams
} from '@kunpeng/variable-resolver';

const modeler = new BpmnModeler({
  container: '#canvas',
  additionalModules: [
    ZeebeVariableResolverModule
  ],
  moddleExtensions = {
    zeebe: ZeebeModdle
  }
});
```

### Retrieving variables

Retrieve the variables from a diagram using the `variableResolver` service:

```javascript
const variableResolver = modeler.get('variableResolver');
const elementRegistry = modeler.get('elementRegistry');

// retrieve variables relevant to an element
const task = elementRegistry.get('Task_1');

// default: variables relevant to <task> in its visible scopes
await variableResolver.getVariablesForElement(task);

// variables read by <task> only
await variableResolver.getVariablesForElement(task, {
  read: true,
  written: false,
});

// all variables written by <task>
await variableResolver.getVariablesForElement(task, {
  written: true,
  read: false,
});

// local variables only (scope === queried element)
await variableResolver.getVariablesForElement(task, {
  local: true,
  external: false,
});

// non-local variables only (scope !== queried element)
await variableResolver.getVariablesForElement(task, {
  local: false,
  external: true,
});

// retrieve all variables defined in a process
const processElement = elementRegistry.get('Process_1');

// returns all variables for the process (unfiltered), for local processing
await variableResolver.getProcessVariables(processElement);
```

`getVariablesForElement(element, options)` supports five filter switches:

| Option | Default | Description |
| --- | --- | --- |
| `read` | `true` | Include variables consumed by the queried element |
| `written` | `true` | Include variables written/created by the queried element |
| `local` | `true` | Include variables local to the queried element scope |
| `external` | `true` | Include variables outside the queried element scope |
| `outputMappings` | `true` | Count output-mapping reads as reads |

### Adding a variable extractor

To add your own variables, extend the `variableProvider` class in your extension. It only needs to implement the `getVariables` method, which takes an element as an argument and returns an array of variables you want to add to the scope of the element. The function can be asynchronous.

```javascript
// MyExtension.js
import VariableProvider from '@kunpeng/variable-resolver/lib/VariableProvider';

class MyCustomProvider extends VariableProvider {
  getVariables(element) {
    const variables = [
      {
        name: 'myVariable',
        type: 'String',
        info: 'This is a global variable',
      },
    ];
    if (is(element, 'bpmn:Process')) {
      return variables;
    }
  }
}

export const MyExtension = {
  __init__: ['myCustomProvider'],
  myCustomProvider: ['type', MyCustomProvider],
};
```

### Advanced use-cases

By default, `getVariablesForElement` and `getProcessVariables` merge variables with the same name and scope into one - entry structure and types are mixed in the merged representation.

In some cases, you might want access to the raw data, e.g. to run lint rules to detect potential schema mismatches between providers. For this, you can use `getRawVariables`:

```javascript
const variableResolver = modeler.get('variableResolver');

const raw = await variableResolver.getRawVariables();

/**
 * raw = {
 *  'Process_1': [
 *    {
 *     name: 'myVariable',
 *     type: 'String',
 *     scope: 'Process_1',
 *     origin: [ 'Task_1' ]
 *    },
 *    {
 *     name: 'myVariable',
 *     type: 'Number',  // Same Variable with different types
 *     scope: 'Process_1',
 *     origin: [ 'Task_2' ]
 *    }
 *  ]
 * }
 */
```

## Development

Prepare the project by installing all dependencies:

```sh
npm install
```

Then, start the example with:

```sh
npm start
```

## License

MIT
