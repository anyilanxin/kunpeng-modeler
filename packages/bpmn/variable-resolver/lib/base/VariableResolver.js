import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import CachedValue from './util/CachedValue';
import { mergeList } from './util/listUtil';
import { getParents } from './util/elementsUtil';

/**
 * @typedef {Object} AdditionalVariable
 * @property {string} name The name of the variable
 * @property {string} [type] The type of the variable
 * @property {string} [info] A description of the variable displayed as a tooltip
 * @property {boolean} [isList] whether the variable is a list
 * @property {Array<AdditionalVariable>} [entries] If the variable is a context, this contains the entries of the context
 * @property {djs.model.Base} [scope] The scope of the variable, by default it is the container element of the element the variable is created from
 */

/**
 * @typedef {AdditionalVariable} ProcessVariable
 * @property {Array<ModdleElement>} origin
 * @property {ModdleElement} [scope]
 * @property {Array<Object>} provider
 * @property {Array<string|ModdleElement>} [usedBy] Elements or variable names consuming this variable
 * @property {Array<string>} [readFrom] Source tags describing where this variable is read from
 */

/**
 * @typedef {Object} VariablesFilterOptions
 * @property {boolean} [read=true] Include consumed variables
 * @property {boolean} [written=true] Include variables written in the queried element
 * @property {boolean} [local=true] Include variables in the queried element scope
 * @property {boolean} [external=true] Include variables outside the queried element scope
 * @property {boolean} [outputMappings=true] Include reads originating from output mappings
 */

/**
 * @typedef {ProcessVariable} AvailableVariable
 */

/**
 * Base Class that handles additional variable extractors, variable parsing and caching.
 */
export class BaseVariableResolver {
  constructor(eventBus, bpmnjs) {
    this.providers = [];
    this._eventBus = eventBus;
    this._bpmnjs = bpmnjs;

    this.rawVariables = new CachedValue(this._generateRawVariables.bind(this));
    this.parsedVariables = new CachedValue(async () => {

      const rawVariables = await this.getRawVariables();
      const context = { variables: rawVariables };

      eventBus.fire('variableResolver.parseVariables', context);

      return context.variables;
    });

    eventBus.on([ 'commandStack.changed', 'diagram.clear', 'import.done', 'variables.changed' ], () => {
      this.invalidateCache();
    });

    eventBus.on('variableResolver.parseVariables', (e, context) => {
      context.variables = this._parseVariables(context.variables);
    });
  }

  /**
   * To be implemented by a subclass. This should be an instance of `getProcessVariables` from `@bpmn-io/extract-process-variables`,
   * either C7 or C8.
   *
   * @returns {Promise<Array<ProcessVariable>>}
   */
  _baseExtractor() {
    return [];
  }


  /**
   * Returns an Object of all variables that are available in the current diagram,
   * mapped to the respective scope.
   * Variables with the same name are NOT merged together. Use this function to
   * run linting, e.g. to check for conflicting variable schemas.
   *
   * The result is cached until the diagram changes.
   *
   * @async
   * @returns {Object} rawVariables
   * @returns {Array<ProcessVariable>} rawVariables.<scope>
   */
  async getRawVariables() {
    return await this.rawVariables.get();
  }

  /**
   * Returns an array of all variables that are available in the current diagram.
   * Variables with the same name are NOT merged together. Use this function to
   * run linting, e.g. to check for conflicting variable schemas.
   *
   * Use this function if you need all availables for all root elements. To filter for scope,
   * use `getProcessVariables` or `getVariablesForElement`
   *
   * The result is cached until the diagram changes.
   *
   * @async
   * @returns {Object} rawVariables
   * @returns {Array<ProcessVariable>} rawVariables.<rootElement>
   */
  async getVariables() {
    return await this.parsedVariables.get();
  }

  /**
   * Force the cache to be invalidated an the variable extractors to be called
   * again the next time `getVariables` is called.
   */
  invalidateCache() {
    this.rawVariables.invalidate();
    this.parsedVariables.invalidate();
  }

  /**
   * Calls the baseExtractor and maps variables to the respective root element.
   * Cf. `getRawVariables`
   *
   * @async
   * @returns {Object} rawVariables
   * @returns {Array<ProcessVariable>} rawVariables.<scope>
   */
  async _generateRawVariables() {
    const bpmnjs = this._bpmnjs;

    const variables = {};

    const workerTasks = bpmnjs.getDefinitions().get('rootElements').map(async element => {

      const elementVariables = await this._baseExtractor(element, [ this._extractor.bind(this) ]);

      // Annotate variables with extractor information
      variables[element.id] = elementVariables.map(variable => {
        if (!variable.provider) {
          variable.provider = [ this._baseExtractor ];
        }

        return variable;
      });
    });

    await Promise.all(workerTasks);

    return variables;
  }


  /**
   * Parses the list of all variables and checks for duplicates. If duplicates are found, the schemas are merged
   * into a single variable.
   * Also maps the attribute `variable.type` to `variable.detail` for the feel editor to display it.
   *
   * Cf. `getVariables`
   *
   * @async
   * @param {Object} rawVariables
   * @param {Array<ProcessVariable>} rawVariables[scope]
   * @returns {Object} parsedVariables
   * @returns {Array<ProcessVariable>} parsedVariables[scope]
   */
  _parseVariables(rawVariables) {
    const parsedVariables = {};

    for (const key in rawVariables) {
      const variables = rawVariables[key];

      const mergedMap = new Map();
      const scopelessVariables = [];

      variables.forEach(variable => {
        const isMergeable = !!(variable.scope || !variable.usedBy);

        if (isMergeable) {
          const mergeKey = `${ variable.name }\0${ variable.scope?.id || '' }`;
          const existingVariable = mergedMap.get(mergeKey);

          if (existingVariable) {
            mergeVariables(existingVariable, variable);
          } else {
            mergedMap.set(mergeKey, variable);
          }
        } else {
          scopelessVariables.push(variable);
        }
      });

      const mergedVariables = Array.from(mergedMap.values()).concat(scopelessVariables);

      mapToEditorFormat(mergedVariables);

      parsedVariables[key] = mergedVariables;
    }

    return parsedVariables;
  }

  /**
   * Callback used by `@bpmn-io/extract-process-variables`. It adds additional information from the <AdditionalVariable>
   * returned from the providers to the <ProcessVariable> that is used by the resolver.
   *
   * It does not have a return value, the variables are added as a side effect to the `context.processVariables` array
   *
   * @async
   * @param {Object} context
   * @param {Array<ModdleElement>} context.elements
   * @param {ModdleElement} context.containerElement
   * @param {Array<ProcessVariable>} context.processVariables
   */
  async _extractor(context) {
    const {
      elements,
      containerElement,
      processVariables
    } = context;

    const self = this;

    const workerTasks = elements.flatMap((element) => {
      return self.providers.map(async (provider) => {
        const newVariables = await provider.getVariables(element);

        if (!newVariables) {
          return;
        }

        // add scope and origin to variables
        newVariables.forEach(variable => {
          processVariables.push({
            ...cloneVariable(variable),
            origin: [ element ],
            scope: variable.scope || this._getScope(element, containerElement, variable.name, true),
            provider: [ provider ]
          });
        });
      });
    });

    await Promise.all(workerTasks);
  }

  /**
   * Add a new VariableProvider. This will be used the next time `getVariables` is called.
   *
   * @param {VariableProvider} provider
   */
  registerProvider(provider) {
    this.providers.push(provider);
    this.invalidateCache();
  }

  /**
   * Returns all variables for the given root element.
   *
   * @async
   * @param {ModdleElement} element
   * @returns {Array<ProcessVariable>} variables
   */
  async getProcessVariables(element) {
    const bo = getBusinessObject(element);

    const allVariables = await this.getVariables();
    return allVariables[bo.id] || [];
  }

  /**
   * Returns all variables in the scope of the given element.
   *
   * All filter switches default to `true`
    *
    * Use `{ read: true, written: false }` to retrieve read-only variables.
   *
   * @async
   * @param {ModdleElement} element
   * @param {VariablesFilterOptions} [options]
   * @returns {Promise<Array<AvailableVariable>>} variables
   */
  async getVariablesForElement(element, options = {}) {
    const bo = getBusinessObject(element);
    const filterOptions = normalizeFilterOptions(options);

    const root = getRootElement(bo);
    const allVariables = await this.getProcessVariables(root);

    // (1) get variables for given scope
    var scopeVariables = allVariables.filter(function(variable) {
      return variable.scope && variable.scope.id === bo.id;
    });

    // (2) get variables for parent scopes
    var parents = getParents(bo);

    var parentsScopeVariables = allVariables.filter(function(variable) {
      return variable.scope && parents.find(function(parent) {
        return parent.id === variable.scope.id;
      });
    });

    // (3) include descendant-scoped variables that are used outside their
    // own scope but still within the current scope (cross-scope leak)
    const leakedVariables = allVariables.filter(variable => {
      return variable.scope
        && variable.scope.id !== bo.id
        && isElementInScope(variable.scope, bo)
        && isUsedInScope(variable, bo)
        && isUsedOutsideOwnScope(variable);
    });

    const reversedVariables = [ ...leakedVariables, ...scopeVariables, ...parentsScopeVariables ].reverse();

    const seenNames = new Set();

    const deduplicatedVariables = reversedVariables.filter(variable => {

      const provider = variable.provider || [];

      // if external variable, keep
      if (provider.find(extractor => extractor !== this._baseExtractor)) {
        return true;
      }

      // if not external, keep only the first occurrence of each name
      if (!seenNames.has(variable.name)) {
        seenNames.add(variable.name);

        return true;
      }

      return false;
    });

    const projectedScopedVariables = deduplicatedVariables.map(variable => {
      if (!variable.usedBy || !Array.isArray(variable.usedBy)) {
        return variable;
      }

      const usedBy = filterUsedByForElement(variable, bo);

      if (isSameUsageList(variable.usedBy, usedBy)) {
        return variable;
      }

      return {
        ...variable,
        usedBy: usedBy.length ? usedBy : undefined
      };
    });

    const consumedVariables = allVariables.filter(variable => {
      return !variable.scope
        && Array.isArray(variable.usedBy)
        && variable.usedBy.some(usage => usage && usage.id === bo.id);
    });

    let candidates = projectedScopedVariables;

    if (filterOptions.read && !filterOptions.written) {
      candidates = [ ...projectedScopedVariables, ...consumedVariables ];
    } else if (filterOptions.read && filterOptions.written && !projectedScopedVariables.length) {

      // Preserve current default behavior: only fall back to consumed variables
      // when no scoped/ancestor variables are available.
      candidates = consumedVariables;
    }

    return candidates.filter(variable => {
      const isLocal = !!(variable.scope && variable.scope.id === bo.id);
      const hasReadUsage = !!(variable.usedBy && variable.usedBy.length);
      const readSources = Array.isArray(variable.readFrom) ? variable.readFrom : [];
      const hasOutputMappingRead = hasReadSource(readSources, 'output-mapping');
      const hasNonOutputRead = hasReadUsage && (!readSources.length || readSources.some(source => source !== 'output-mapping'));
      const isRead = hasNonOutputRead || (filterOptions.outputMappings && hasOutputMappingRead);
      const isWritten = !!(variable.origin && variable.origin.some(origin => origin && origin.id === bo.id));

      return matchesTypeFilter(isRead, isWritten, filterOptions)
        && matchesScopeFilter(isLocal, filterOptions);
    });
  }

  _getScope(element, containerElement, variableName, checkYourself) {
    throw new Error('not implemented VariableResolver#_getScope');
  }
}

BaseVariableResolver.$inject = [ 'eventBus', 'bpmnjs' ];


// helpers //////////////////////

function getRootElement(element) {
  const businessObject = getBusinessObject(element);

  if (is(businessObject, 'bpmn:Participant')) {
    return businessObject.processRef;
  }

  if (is(businessObject, 'bpmn:Process')) {
    return businessObject;
  }

  let parent = businessObject;

  while (parent.$parent && !is(parent, 'bpmn:Process')) {
    parent = parent.$parent;
  }

  return parent;
}

/**
 * @param {ProcessVariable} a
 * @param {ProcessVariable} b
 */
function mergeVariables(a, b) {
  merge('origin', a, b);
  merge('provider', a, b);
  merge('usedBy', a, b);
  merge('readFrom', a, b);
  mergeEntries(a, b);
}

function merge(property, target, source) {
  if (!source[property]) {
    return;
  }

  if (!target[property]) {
    target[property] = [];
  }

  const propertiesToAdd = source[property].filter(o => !target[property].includes(o));

  target[property].push(...propertiesToAdd);
}

export function mergeEntries(target, source, visited = []) {
  if (visited.includes(source) || visited.includes(target)) {
    return;
  }
  visited.push(source);
  visited.push(target);

  target.type = mergeList(target.type, source.type, '|', true);
  target.info = mergeList(target.info, source.info, '\n');
  target.isList = !!target.isList === !!source.isList ? target.isList : 'optional';

  if (!source.entries) {
    return;
  }

  if (!target.entries) {
    target.entries = [];
  }

  source.entries.forEach(variable => {
    const existingEntry = target.entries.find(e => e.name === variable.name);

    if (existingEntry) {
      mergeEntries(existingEntry, variable, visited);
    } else {
      target.entries.push(variable);
    }
  });
}

function mapToEditorFormat(variables) {
  if (!variables) {
    return;
  }

  variables.forEach(variable => {
    if (!variable.type && !variable.entries?.length) {
      variable.type = 'Null';
    }

    variable.detail = variable.type;

    if (variable.entries) {
      mapToEditorFormat(variable.entries);
    }
  });
}

function cloneVariable(variable) {
  const newVariable = { ...variable };

  if (newVariable.entries) {
    newVariable.entries = newVariable.entries.map(cloneVariable);
  }

  return newVariable;
}

function isUsedInScope(variable, scopeElement) {
  if (!variable.usedBy || !Array.isArray(variable.usedBy)) {
    return false;
  }

  return variable.usedBy.some(usedBy => isElementInScope(usedBy, scopeElement));
}

function isElementInScope(element, scopeElement) {
  if (!element || !element.id || !scopeElement || !scopeElement.id) {
    return false;
  }

  if (element.id === scopeElement.id) {
    return true;
  }

  return getParents(element).some(parent => parent.id === scopeElement.id);
}

function isUsedOutsideOwnScope(variable) {
  if (!variable.scope || !Array.isArray(variable.usedBy)) {
    return false;
  }

  return variable.usedBy.some(usedBy => {
    return usedBy && usedBy.id && !isElementInScope(usedBy, variable.scope);
  });
}

function filterUsedByForElement(variable, element) {
  const names = variable.usedBy.filter(usage => typeof usage === 'string');
  const elements = variable.usedBy.filter(usage => usage && usage.id);

  if (!variable.scope) {
    return elements;
  }

  // Querying the variable's own scope: show local consumers.
  if (element.id === variable.scope.id) {
    const localConsumers = elements.filter(usage => isElementInScope(usage, variable.scope));

    if (localConsumers.length) {
      return localConsumers;
    }

    // For local mapping dependencies represented as names, expose the
    // querying element as the consumer.
    return names.length ? [ element ] : [];
  }

  // Querying an ancestor scope: show consumers outside the variable's own scope.
  if (isElementInScope(variable.scope, element)) {
    return elements.filter(usage =>
      isElementInScope(usage, element)
      && !isElementInScope(usage, variable.scope)
    );
  }

  // Querying a child scope: show consumers in that child scope only.
  if (isElementInScope(element, variable.scope)) {
    return elements.filter(usage => isElementInScope(usage, element));
  }

  return [];
}

function normalizeFilterOptions(options) {
  options = options || {};

  return {
    read: options.read !== false,
    written: options.written !== false,
    local: options.local !== false,
    external: options.external !== false,
    outputMappings: options.outputMappings !== false
  };
}

function matchesTypeFilter(isRead, isWritten, options) {
  if (options.read && options.written) {
    return true;
  }

  if (options.read) {
    return isRead;
  }

  if (options.written) {
    return isWritten;
  }

  return false;
}

function matchesScopeFilter(isLocal, options) {
  if (options.local && options.external) {
    return true;
  }

  if (options.local) {
    return isLocal;
  }

  if (options.external) {
    return !isLocal;
  }

  return false;
}

function isSameUsageList(usagesA, usagesB) {
  if (!Array.isArray(usagesA) || !Array.isArray(usagesB)) {
    return false;
  }

  if (usagesA.length !== usagesB.length) {
    return false;
  }

  const keysA = usagesA.map(getUsageKey).sort();
  const keysB = usagesB.map(getUsageKey).sort();

  return keysA.every((key, index) => key === keysB[index]);
}

function getUsageKey(usage) {
  if (typeof usage === 'string') {
    return `name:${usage}`;
  }

  if (usage && usage.id) {
    return `id:${usage.id}`;
  }

  return String(usage);
}

function hasReadSource(readFrom, sourceName) {
  return Array.isArray(readFrom) && readFrom.includes(sourceName);
}