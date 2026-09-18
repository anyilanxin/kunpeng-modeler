import { getProcessVariables, getScope } from '@kunpeng/extract-process-variables';
import { BaseVariableResolver } from './base/VariableResolver';
import {
  parseVariables,
  getElementNamesToRemove,
  extractConsumedVariablesFromElements
} from './util/feelUtility';
import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { getInputOutput } from './base/util/ExtensionElementsUtil';


const HIGH_PRIORITY = 2000;

const HIGHER_PRIORITY = 2250;

/**
 * The Kunpeng Implementation for the VariableResolver.
 */
export default class KunpengVariableResolver extends BaseVariableResolver {
  constructor(eventBus, bpmnjs) {
    super(eventBus, bpmnjs);
    this._baseExtractor = getProcessVariables;
    this._getScope = getScope;

    eventBus.on('variableResolver.parseVariables', HIGHER_PRIORITY, this._resolveVariables.bind(this));
    eventBus.on('variableResolver.parseVariables', HIGH_PRIORITY, this._expandVariables);
  }

  /**
   * Returns variables for an element.
   *
   * Supported signatures:
   * - `getVariablesForElement(element, options)`
   * - `getVariablesForElement(element, moddleElement, options)`
   *
   * The second signature can be used to remove pre-defined mapping variables
   * from the result based on the given moddle element.
   *
   * @param {ModdleElement} element
    * @param {ModdleElement|Object} [optionsOrModdleElement] A moddle element or filter options
    * @param {Object} [options] Filter options when a moddle element is provided
    * @param {boolean} [options.read]
    * @param {boolean} [options.written]
    * @param {boolean} [options.local]
    * @param {boolean} [options.external]
    * @param {boolean} [options.outputMappings]
   * @returns {Promise<Array<ProcessVariable>>}
   */
  async getVariablesForElement(element, optionsOrModdleElement, options) {
    const {
      moddleElement,
      filterOptions
    } = normalizeGetVariablesForElementArguments(optionsOrModdleElement, options);

    const variables = await super.getVariablesForElement(element, filterOptions);

    const bo = getBusinessObject(element);

    if (!moddleElement) {
      return variables;
    }

    const inputOutput = getInputOutput(bo);

    if (!inputOutput) {
      return variables;
    }

    const namesToFilter = getElementNamesToRemove(moddleElement, inputOutput);

    return variables.filter(v => {

      // Keep all variables that are also defined in other elements
      if (!Array.isArray(v.origin) || v.origin.length > 1 || v.origin[0] !== bo) {
        return true;
      }

      // Keep all variables from external data providers in outputs
      if (
        is(moddleElement, 'zeebe:Output') &&
        v.provider.find(extractor => extractor !== this._baseExtractor)
      ) {
        return true;
      }

      // Filter all pre-defined variables
      return !namesToFilter.includes(v.name);
    });
  }

  /**
   * Expand hierarchical name variables.
   *
   * @param {Event} e
   * @param {Object} context
   * @param {Array<ProcessVariable>} context.variables
   */
  _expandVariables(e, context) {
    const rawVariables = context.variables;

    const mappedVariables = {};

    for (const key in rawVariables) {
      mappedVariables[key] = expandHierarchicalNames(rawVariables[key]);
    }

    context.variables = mappedVariables;
  }

  /**
   * Parsed the variables and resolves the variable schema to kept the
   * variable schema throughout the process.
   *
   * @param {Event} e
   * @param {Object} context
   * @param {Array<ProcessVariable>} context.variables
   */
  _resolveVariables(e, context) {
    const rawVariables = context.variables;
    const definitions = this._bpmnjs.getDefinitions();

    const mappedVariables = {};

    for (const key in rawVariables) {
      const variables = rawVariables[key];
      const { resolvedVariables, consumedVariables } = parseVariables(variables);
      const rootElement = getRootElementById(definitions, key);
      const elementConsumedVariables = rootElement
        ? extractConsumedVariablesFromElements(getFlowElements(rootElement))
        : [];

      mappedVariables[key] = [
        ...variables,
        ...resolvedVariables,
        ...consumedVariables,
        ...elementConsumedVariables
      ];
    }

    context.variables = mappedVariables;
  }
}

function normalizeGetVariablesForElementArguments(optionsOrModdleElement, options) {
  const looksLikeOptions = isFilterOptions(optionsOrModdleElement);

  if (looksLikeOptions) {
    return {
      moddleElement: null,
      filterOptions: optionsOrModdleElement
    };
  }

  return {
    moddleElement: optionsOrModdleElement || null,
    filterOptions: isFilterOptions(options) ? options : undefined
  };
}

function isFilterOptions(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return [ 'read', 'written', 'local', 'external', 'outputMappings' ].some(key => key in value);
}

function getRootElementById(definitions, id) {
  if (!definitions || !Array.isArray(definitions.rootElements)) {
    return null;
  }

  return definitions.rootElements.find(root => root && root.id === id) || null;
}

function getFlowElements(rootElement) {
  const flowElements = [];
  const queue = [ rootElement ];

  while (queue.length) {
    const element = queue.shift();

    if (!element || !Array.isArray(element.flowElements)) {
      continue;
    }

    for (const flowElement of element.flowElements) {
      flowElements.push(flowElement);

      if (Array.isArray(flowElement.flowElements)) {
        queue.push(flowElement);
      }
    }
  }

  return flowElements;
}

/**
 * @param {Array<ProcessVariable>} variables
 *
 * @return {Array<ProcessVariable>}
 */
function expandHierarchicalNames(variables) {

  return variables.map(variable => {

    const {
      name,
      scope,
      provider,
      origin
    } = variable;

    const nameParts = name.split('.');

    if (nameParts.length === 1) {
      return variable;
    }

    const chain = [ {
      ...variable,
      name: nameParts[nameParts.length - 1]
    } ];

    for (let idx = nameParts.length - 1; idx > 0; idx--) {
      const namePart = nameParts[idx - 1];
      const lastVariable = chain[0];

      chain.unshift({
        name: namePart,
        type: 'Context',
        scope,
        provider,
        origin,
        usedBy: lastVariable.usedBy ? [ ...lastVariable.usedBy ] : undefined,
        entries: [
          lastVariable
        ]
      });
    }

    return chain[0];
  });
}
