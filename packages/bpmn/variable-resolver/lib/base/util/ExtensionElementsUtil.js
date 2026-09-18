import { is } from 'bpmn-js/lib/util/ModelUtil';
import { filter } from 'min-dash';

export function hasOutputMappings(element) {
  return !!getOutputParameters(element).length;
}

export function hasInputParameter(element, name) {
  return getInputParameters(element).find(function(input) {
    return (
      input.target === name || // zeebe
      input.name === name // camunda
    );
  });
}

export function getExtensionElementsList(businessObject, type = undefined) {
  const extensionElements = businessObject.get('extensionElements');

  if (!extensionElements) {
    return [];
  }

  const values = extensionElements.get('values');

  if (!values || !values.length) {
    return [];
  }

  if (type) {
    return values.filter(value => is(value, type));
  }

  return values;
}

// helpers //////////

function getInputParameters(element) {
  return getParameters(element, 'inputParameters');
}

function getOutputParameters(element) {
  return getParameters(element, 'outputParameters');
}

export function getInputOutput(element) {
  return (
    (getExtensionElements(element, 'zeebe:IoMapping'))[0] ||
    (getExtensionElements(element, 'camunda:InputOutput'))[0]
  );
}

function getParameters(element, property) {
  var inputOutput = getInputOutput(element);

  return (inputOutput && inputOutput.get(property)) || [];
}

function getExtensionElements(element, type) {
  var elements = [];
  var extensionElements = element.get('extensionElements');

  if (typeof extensionElements !== 'undefined') {
    var extensionValues = extensionElements.get('values');

    if (typeof extensionValues !== 'undefined') {
      elements = filter(extensionValues, function(value) {
        return is(value, type);
      });
    }
  }

  return elements;
}
