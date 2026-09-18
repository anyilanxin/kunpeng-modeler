import { parser, trackVariables } from '@kunpeng/lezer-expression';
import {
  ContextTracker,
} from '@lezer/lr';

import { has, isNil } from 'min-dash';
import { FeelAnalyzer } from '@kunpeng/expression-analyzer';

import { EntriesContext } from './VariableContext';
import { getExtensionElementsList } from '../base/util/ExtensionElementsUtil';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getParents } from '../base/util/elementsUtil';
import { mergeList } from '../base/util/listUtil';
import { mergeEntries } from '../base/VariableResolver';
import { kunpengBuiltins, kunpengReservedNameBuiltins } from '@kunpeng/expression-builtins';

const feelAnalyzer = new FeelAnalyzer({
  dialect: 'expression',
  parserDialect: 'kunpeng',
  builtins: kunpengBuiltins,
  reservedNameBuiltins: kunpengReservedNameBuiltins
});

/**
 * Parse FEEL-based variable expressions and return resolved + consumed variables.
 *
 * This includes script expressions and IO mappings, and is designed to handle
 * FEEL-enabled variable definitions exposed by the collected variable origins.
 * Resolution uses the highest-priority expression for each variable/origin pair.
 * Consumption analysis inspects all relevant non-output expressions.
 *
 * @param {Array<ProcessVariable>} variables
 * @returns {{ resolvedVariables: Array<ProcessVariable>, consumedVariables: Array<ProcessVariable> }}
 */
export function parseVariables(variables) {
  const variablesToResolve = [];
  const analysisResults = [];

  // Step 1 - Parse all variables and populate all that don't have references
  // to other variables
  variables.forEach(variable => {
    variable.origin.forEach(origin => {
      const expressionCandidates = findExpressions(variable, origin);

      if (expressionCandidates.length === 0) {
        return;
      }

      const expression = selectPrimaryExpression(expressionCandidates);

      if (isNil(expression)) {
        return;
      }

      const expressionDetails = getExpressionDetails(expression);

      const {
        unresolved
      } = expressionDetails;

      variablesToResolve.push({ variable, expression, unresolved });

      const requirementAnalyses = collectRequirementAnalyses(expressionCandidates, expression, expressionDetails);

      for (const { expressionType, inputs } of requirementAnalyses) {
        analysisResults.push({
          origin,
          scope: origin,
          targetName: variable.name,
          inputs,
          expressionType
        });
      }
    });
  });

  // Step 2 - Order all Variables and resolve them
  const resolvedVariables = resolveReferences(variablesToResolve, variables);

  // Step 3 - Build consumed variables from collected analyses
  const { consumed: consumedVariables, localUsages } = buildConsumedVariables(analysisResults);

  // Step 4 - Annotate locally-provided variables with usedBy information
  for (const { variableName, targetName, origin, expressionType } of localUsages) {
    const variable = findNearestScopedVariable(variables, variableName, origin);

    if (!variable) {
      continue;
    }

    // Keep existing behavior for same-origin mappings (`usedBy: [ 'targetVar' ]`)
    // and use the consuming element for ancestor-scoped variables.
    const usage = variable.scope === origin ? targetName : origin;

    if (!variable.usedBy) {
      variable.usedBy = [];
    }

    if (!hasUsage(variable.usedBy, usage)) {
      variable.usedBy.push(usage);
    }

    if (!variable.readFrom) {
      variable.readFrom = [];
    }

    if (!variable.readFrom.includes(expressionType)) {
      variable.readFrom.push(expressionType);
    }
  }

  // Step 5 - Bridge consumed usages back to uniquely scoped declarations
  annotateConsumedUsagesToScopedVariables(variables, consumedVariables);

  return { resolvedVariables, consumedVariables };
}

function annotateConsumedUsagesToScopedVariables(variables, consumedVariables) {
  for (const consumedVariable of consumedVariables) {
    const candidateNames = getConsumedVariableCandidateNames(consumedVariable);

    for (const candidateName of candidateNames) {
      annotateConsumedUsagesToScopedVariableByName(
        variables,
        candidateName,
        consumedVariable.usedBy || [],
        consumedVariable.readFrom || []
      );
    }
  }
}

function annotateConsumedUsagesToScopedVariableByName(variables, variableName, usages, readFrom) {
  const scopedCandidates = variables.filter(v => v.name === variableName && v.scope);

  if (scopedCandidates.length !== 1) {
    return;
  }

  const scopedVariable = scopedCandidates[0];

  if (!scopedVariable.usedBy) {
    scopedVariable.usedBy = [];
  }

  if (!scopedVariable.readFrom) {
    scopedVariable.readFrom = [];
  }

  for (const usage of usages) {
    if (!usage || !usage.id) {
      continue;
    }

    if (!hasUsage(scopedVariable.usedBy, usage)) {
      scopedVariable.usedBy.push(usage);
    }
  }

  readFrom.forEach(source => {
    if (!scopedVariable.readFrom.includes(source)) {
      scopedVariable.readFrom.push(source);
    }
  });
}

function getConsumedVariableCandidateNames(consumedVariable) {
  const names = [ consumedVariable.name ];

  if (!consumedVariable.entries || !consumedVariable.entries.length) {
    return names;
  }

  return [
    ...names,
    ...getNestedConsumedVariableNames(consumedVariable.name, consumedVariable.entries)
  ];
}

function getNestedConsumedVariableNames(prefix, entries) {
  const names = [];

  for (const entry of entries || []) {
    const name = `${prefix}.${entry.name}`;
    names.push(name);

    if (entry.entries && entry.entries.length) {
      names.push(...getNestedConsumedVariableNames(name, entry.entries));
    }
  }

  return names;
}

function findNearestScopedVariable(variables, variableName, origin) {
  const scopes = [ origin, ...getParents(origin) ];

  for (const scope of scopes) {
    const variable = variables.find(v => v.name === variableName && v.scope === scope);

    if (variable) {
      return variable;
    }
  }

  return null;
}

function hasUsage(usages, usage) {
  return usages.some(existing => {
    if (existing === usage) {
      return true;
    }

    if (typeof existing === 'string' && typeof usage === 'string') {
      return existing === usage;
    }

    return existing && usage && existing.id && usage.id && existing.id === usage.id;
  });
}

/**
 * Resolve variable expressions against each other in dependency order.
 *
 * Variables with expression mappings are evaluated in a best-effort topological
 * order. Variables without mappings are provided as initial context.
 *
 * @param {Array<{ variable: ProcessVariable, expression: string, unresolved: Array<string> }>} variablesToResolve
 * @param {Array<ProcessVariable>} allVariables
 * @returns {Array<ProcessVariable>}
 */
function resolveReferences(variablesToResolve, allVariables) {
  const sortedVariables = [];

  // Step 2.1 - Try to order Variables that rely on each other
  variablesToResolve.forEach((details) => {
    const { variable, unresolved } = details;
    const insertBefore = sortedVariables.findIndex(({ unresolved: u }) => {
      return u.includes(variable.name);
    });

    // Insert directly before the first variable that depends on this one
    if (insertBefore > -1) {
      sortedVariables.splice(insertBefore, 0, details);
      return;
    }

    // Insert directly after the last variable that this one depends on
    // this ensures that later downstream variables are behind this one
    const insertAfter = sortedVariables.findLastIndex(({ variable: v }) => {
      return unresolved.includes(v.name);
    });

    if (insertAfter > -1) {
      sortedVariables.splice(insertAfter + 1, 0, details);
      return;
    }

    sortedVariables.push(details);
  });

  const variablesWithoutMappings = allVariables.filter(v =>
    !variablesToResolve.find(({ variable: unresolved }) => {
      return v === unresolved;
    })
  );

  const rootContext = {
    name: 'OuterContext',
    entries: toOptimizedFormat(variablesWithoutMappings.filter(v => v.scope))
  };

  const newVariables = [];

  // Step 2.2 - parse in order, building up the context with resolved variable values
  // This will resolve all variables that don't have circular dependencies on each other
  sortedVariables.forEach(({ variable, expression, unresolved }) => {
    const scopedContext = filterForScope(rootContext, variable);
    const resultContext = getResultContext(expression, scopedContext);

    let computedResult = resultContext.computedValue();

    // Wrap primitive values in an EntriesContext
    if (!(computedResult instanceof EntriesContext)) {
      computedResult = EntriesContext.of(computedResult);
    }

    // If the result is null but a referenced variable was absent from scope, the null
    // means "unknown" (e.g. provided by a job worker at run-time), not "proven Null".
    // Clear atomicValue so getType() returns 'Any' instead of 'Null'.
    // Only consider top-level variable names; dotted paths (e.g. "foo.bar") are property
    // accesses, not standalone variable references that would indicate an out-of-scope variable.
    const unresolvedRoots = unresolved.filter(name => !name.includes('.'));

    if (computedResult.value.atomicValue === null &&
        unresolvedRoots.some(name => !has(scopedContext.entries, name))) {
      computedResult = EntriesContext.of(undefined);

      // Preserve the FEEL expression for user interface
      computedResult.value.info = expression;
    }

    // If the result is null but a referenced variable is "Any"-typed (unknown
    // structure), accessing a property on it should also yield "Any", not "Null".
    // cf. https://github.com/bpmn-io/variable-resolver/issues/87
    else if (computedResult.value.atomicValue === null &&
        unresolvedRoots.some(name => {
          const entry = scopedContext.entries[name];
          return entry instanceof EntriesContext &&
                 getType(entry.value) === 'Any';
        })) {
      computedResult = EntriesContext.of(undefined);
      computedResult.value.info = expression;
    }

    // Ensure we don't copy the scope from the mapped variable
    computedResult.scope = variable.scope;

    // If the same variable name was already resolved (e.g. via input mapping AND a task output),
    // merge the types so downstream expressions see the full union (e.g. 'Null|Number').
    const existing = rootContext.entries[variable.name];

    if (existing) {
      const existingType = getType(existing.value);
      const newType = getType(computedResult.value);
      const mergedType = mergeList(existingType, newType, '|', true);
      if (mergedType) {
        computedResult.value.type = mergedType;
      }
    }

    rootContext.entries[variable.name] = computedResult;

    newVariables.push({
      newVariable: toUnifiedFormat({
        [variable.name]: computedResult
      })[0],
      oldVariable: variable
    });
  });

  // Ensure meta-data (scope, origin) is kept from original variable
  const enrichedVariables = newVariables.map(({ newVariable, oldVariable }) => {
    if (oldVariable) {
      return {
        ...newVariable,
        ...oldVariable
      };
    }
    return newVariable;
  });

  return enrichedVariables;
}


// helpers //////////////////////

/**
 * Parses the expression with the given variables and return the result context.
 *
 * Without a leading `=` the expression is interpreted as a string literal.
 *
 * @param {string} expression
 * @param {Variables} variables
 * @returns {EntriesContext}
 */
export function getResultContext(expression, variables = {}) {

  const contextTracker = trackVariables(variables, EntriesContext);

  // expression is a static value
  if (!expression.startsWith('=')) {

    // empty expressions are invalid FEEL, mapped to `null`
    // TODO(nikku): completely unsafe stuff, don't do, remove ASAP
    return contextTracker.start.literal(expression || null);
  }

  // remove leading `=`
  expression = expression.substring(1);


  // This is a hack to get the latest variables from the context tracker
  // lezer does not automatically annotate the parse tree with the context
  let latestVariables = contextTracker.start;

  const customContextTracker = new ContextTracker({
    start: contextTracker.start,
    reduce(...args) {
      const result = contextTracker.reduce(...args);
      latestVariables = result;
      return result;
    }
  });

  const contextualParser = parser.configure({
    contextTracker: customContextTracker,
    dialect: 'camunda',
    strict: true
  });

  try {
    contextualParser.parse(expression);
  } catch (error) {

    // bail out in case of an error
    return latestVariables;
  }

  return latestVariables;
}

/**
 * Find all matching expression sources for a variable on a given origin element.
 *
 * Returns candidates ordered by resolution priority (first = highest).
 * Local variables: script > input-mapping (script result overwrites at runtime).
 * Global variables: output-mapping > script.
 *
 * @param {ProcessVariable} variable
 * @param {djs.model.Base} origin
 * @returns {Array<{ type: string, value: string }>}
 */
function findExpressions(variable, origin) {
  const isLocal = variable.scope === origin;

  const candidates = isLocal
    ? [
      { type: 'script', value: getScriptExpression(variable, origin) },
      { type: 'input-mapping', value: getIoInputExpression(variable, origin) },
    ]
    : [
      { type: 'output-mapping', value: getIoOutputExpression(variable, origin) },
      { type: 'script', value: getScriptExpression(variable, origin) },
    ];

  return candidates.filter(c => !isNil(c.value));
}

/**
 * Pick the highest-priority expression from expression candidates.
 *
 * @param {Array<{ type: string, value: string }>} expressionCandidates
 * @returns {string|undefined}
 */
function selectPrimaryExpression(expressionCandidates) {
  const [ primary ] = expressionCandidates;

  return primary && primary.value;
}

/**
 * Analyze candidate expressions for consumed variables.
 *
 * Includes output mappings so callers can decide whether to show or filter
 * output-mapping reads.
 *
 * @param {Array<{ type: string, value: string }>} expressionCandidates
 * @param {string} primaryExpression
 * @param {{ unresolved: Array<string>, inputs: Array }} primaryExpressionDetails
 * @returns {Array<{ expressionType: string, inputs: Array }>}
 */
function collectRequirementAnalyses(expressionCandidates, primaryExpression, primaryExpressionDetails) {
  const requirementAnalyses = [];

  for (const { type, value } of expressionCandidates) {
    const analysis = value === primaryExpression
      ? primaryExpressionDetails
      : getExpressionDetails(value);

    if (analysis.inputs.length > 0) {
      requirementAnalyses.push({
        expressionType: type,
        inputs: analysis.inputs
      });
    }
  }

  return requirementAnalyses;
}

/**
 * Given a FEEL expression, return unresolved variables and consumed input variables.
 *
 * @param {string} expression
 * @returns {{ unresolved: Array<string>, inputs: Array }}
 */
function getExpressionDetails(expression) {

  const result = getResultContext(expression);
  const unresolved = findUnresolvedVariables(result);

  // Static values (no leading '=') are string literals, not FEEL expressions.
  // They don't reference any variables and must not be analyzed for inputs.
  if (!expression.startsWith('=')) {
    return { unresolved, inputs: [] };
  }

  const analysisResult = feelAnalyzer.analyzeExpression(expression);
  const inputs = analysisResult.valid !== false && analysisResult.inputs
    ? analysisResult.inputs
    : [];

  return { unresolved, inputs };
}

/**
 * Given a variable and origin, return input mapping expression targeting the variable.
 *
 * @param {ProcessVariable} variable
 * @param {djs.model.Base} origin
 * @returns {string|undefined}
 */
function getIoInputExpression(variable, origin) {
  return getIoExpressionByType(variable, origin, 'input');
}

/**
 * Given a variable and origin, return output mapping expression targeting the variable.
 *
 * @param {ProcessVariable} variable
 * @param {djs.model.Base} origin
 * @returns {string|undefined}
 */
function getIoOutputExpression(variable, origin) {
  return getIoExpressionByType(variable, origin, 'output');
}

/**
 * Given a variable and origin, return mapping expression by mapping type.
 *
 * @param {ProcessVariable} variable
 * @param {djs.model.Base} origin
 * @param {'input'|'output'} mappingType
 * @returns {string|undefined}
 */
function getIoExpressionByType(variable, origin, mappingType) {
  const ioMapping = getExtensionElementsList(origin, 'zeebe:IoMapping')[0];

  if (!ioMapping) {
    return;
  }

  const mappings = mappingType === 'input'
    ? ioMapping.inputParameters
    : ioMapping.outputParameters;

  if (!mappings) {
    return;
  }

  const mapping = mappings.slice().reverse().find(
    mapping => mapping.target === variable.name
  );

  // treat non-existing source as empty, to yield <null>
  return mapping && (mapping.source || '');
}

/**
 * Given a Variable and a specific origin, return the mapping expression for script
 * task result variable. Returns undefined if no mapping exists for the given origin.
 *
 * @param {ProcessVariable} variable
 * @param {djs.model.Base} origin
 * @returns {string|undefined}
 */
function getScriptExpression(variable, origin) {
  const script = getExtensionElementsList(origin, 'zeebe:Script')[0];

  if (!script) {
    return;
  }

  if (script.resultVariable === variable.name) {

    // treat non-existing expression as empty, to yield <null>
    return script.expression || '';
  }
}

/**
 * Traverses the parseTree and returns all `VariableName` nodes with no value
 *
 * @param {Object} node
 * @returns {Array<string>}
 */
function findUnresolvedVariables(node) {
  const results = [];

  if (node.name === 'PathExpression') {
    const [ object ] = node.children;
    results.push(...findUnresolvedVariables(object));
    return results;
  }

  results.push(...(node.children.flatMap(findUnresolvedVariables)));

  if (node.name === 'VariableName' && !node.value) {
    results.push(node.raw);
  }

  return results;
}


/**
 * Transforms the entries of a variable from an array to an object.
 * This allows faster lookup times during parsing.
 *
 * [ { name, entries: [] } ]
 * to
 * {name: { name, entries: {} }}
 */
function toOptimizedFormat(variables) {

  if (!variables) {
    return;
  }

  const result = {};

  variables.forEach(variable => {
    result[variable.name] = { ...variable };
    result[variable.name].entries = toOptimizedFormat(variable.entries);
  });

  return result;
}

/**
 * Transforms EntriesContext to the format required by the feel-editor
 */
export function toUnifiedFormat(variables) {
  if (!variables) {
    return;
  }

  const result = [];

  for (const key in variables) {
    let variable = variables[key];

    if (variable instanceof EntriesContext) {
      variable = variable.value;
    }

    if (!variable) {
      result.push({
        name: key,
        type: 'Null',
        info: 'null'
      });
      continue;
    }

    result.push({
      ...annotate(variable),
      entries: toUnifiedFormat(variable.entries),
      name: key,
      scope: variable.scope
    });
  }

  return result;
}


function annotate(variable) {
  return {
    ...variable,
    type: getType(variable),
    info: getInfo(variable)
  };

}

function getType(variable) {

  if (!variable) {
    return '';
  }

  if (variable.type) {
    return variable.type;
  }

  if (variable.entries && Object.keys(variable.entries).length) {
    return 'Context';
  }

  if (variable.atomicValue === null) {
    return 'Null';
  }

  if (!isNil(variable.atomicValue)) {
    return capitalize(typeof variable.atomicValue);
  }

  return 'Any';
}

function getInfo(variable) {
  if (!variable) {
    return '';
  }

  if (variable.info) {
    return variable.info;
  }

  if (!isNil(variable.atomicValue)) {
    if (typeof variable.atomicValue === 'string') {
      return JSON.stringify(variable.atomicValue);
    }
    return '' + variable.atomicValue;
  }

  return '';
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function filterForScope(context, variable) {
  const scopedResults = {
    entries: {}
  };

  const validScopes = variable.origin.flatMap(bo => {
    return [ bo, ...getParents(bo) ];
  });

  for (const key in context.entries) {
    const entry = context.entries[key];

    if (entry.scope && validScopes.find(scope => scope.id === entry.scope.id)) {
      scopedResults.entries[key] = entry;
    }
  }

  return scopedResults;
}

/**
 * Remove input/output element name after current definition
 */
export function getElementNamesToRemove(moddleElement, inputOutput) {
  const namesToFilter = [];

  // Input: remove all inputs defined after the current input definition
  if (is(moddleElement, 'zeebe:Input')) {
    const allInputs = inputOutput.inputParameters;

    const inputsToFilter =
        allInputs
          .slice(allInputs.indexOf(moddleElement))
          .map(o => o.target);

    namesToFilter.push(...inputsToFilter);
  }

  const allOutputs = inputOutput.outputParameters;

  // Output: remove all outputs defined after the current output definition
  if (is(moddleElement, 'zeebe:Output')) {

    // Get all output mappings defined after the current element, including own name
    const outputsToFilter = allOutputs
      .slice(allOutputs.indexOf(moddleElement))
      .map(o => o.target);

    namesToFilter.push(...outputsToFilter);
  }

  // Input or general property: remove all outputs
  else if (allOutputs) {

    // Input or execution-related element, remove all outputs
    const outputsToFilter = allOutputs
      .map(o => o.target);

    namesToFilter.push(...outputsToFilter);
  }

  return namesToFilter;
}

/**
 * Extract consumed variables from FEEL expressions that are not represented by
 * variable mappings, e.g. sequence flow conditions and receive-task
 * subscription keys.
 *
 * @param {Array<ModdleElement>} elements
 * @returns {Array<ProcessVariable>}
 */
export function extractConsumedVariablesFromElements(elements = []) {
  const consumedVariables = new Map();
  const inputMappingTargetsCache = new Map();

  const elementExpressions = getElementExpressions(elements);

  for (const { element, expression } of elementExpressions) {
    const { inputs } = getExpressionDetails(expression);

    if (!inputMappingTargetsCache.has(element)) {
      inputMappingTargetsCache.set(element, new Set(getInputMappingTargetNames(element)));
    }

    const inputMappingTargets = inputMappingTargetsCache.get(element);

    for (const inputVar of inputs) {
      if (inputMappingTargets.has(inputVar.name)) {
        continue;
      }

      const existingVariable = consumedVariables.get(inputVar.name);

      if (!existingVariable) {
        consumedVariables.set(inputVar.name, {
          name: inputVar.name,
          origin: undefined,
          scope: undefined,
          entries: inputVar.entries || [],
          usedBy: [ element ]
        });

        continue;
      }

      if (inputVar.entries && inputVar.entries.length) {
        mergeEntries(existingVariable, { entries: inputVar.entries });
      }

      if (!hasUsage(existingVariable.usedBy, element)) {
        existingVariable.usedBy.push(element);
      }
    }
  }

  return Array.from(consumedVariables.values());
}

function getElementExpressions(elements) {
  const expressions = [];

  for (const element of elements) {
    collectFlowExpressions(element, expressions);
    collectMessageExpressions(element, expressions);
    collectLoopExpressions(element, expressions);
    collectEventDefinitionExpressions(element, expressions);
    collectZeebeExtensionExpressions(element, expressions);
  }

  return expressions;
}

function collectFlowExpressions(element, expressions) {
  if (is(element, 'bpmn:SequenceFlow')) {
    const conditionBody = element.conditionExpression?.body;

    if (typeof conditionBody === 'string' && conditionBody.trim()) {
      expressions.push({ element, expression: conditionBody });
    }
  }

  if (is(element, 'bpmn:AdHocSubProcess')) {
    const completionConditionBody = element.completionCondition?.body;

    if (typeof completionConditionBody === 'string' && completionConditionBody.trim()) {
      expressions.push({ element, expression: completionConditionBody });
    }
  }
}

function collectMessageExpressions(element, expressions) {
  const messageEventDef = getEventDefinition(element, 'bpmn:MessageEventDefinition');
  const messageRef = is(element, 'bpmn:ReceiveTask')
    ? element.messageRef
    : messageEventDef && messageEventDef.messageRef;

  if (!messageRef) {
    return;
  }

  if (messageRef.name) {
    expressions.push({ element, expression: messageRef.name });
  }

  const subscription = getExtensionElementsList(messageRef, 'zeebe:Subscription')[0];

  if (subscription && subscription.correlationKey) {
    expressions.push({ element, expression: subscription.correlationKey });
  }
}

function collectLoopExpressions(element, expressions) {
  const loopCharacteristics = element.loopCharacteristics;

  if (!loopCharacteristics) {
    return;
  }

  const zeebeLoop = getExtensionElementsList(loopCharacteristics, 'zeebe:LoopCharacteristics')[0];

  if (zeebeLoop) {
    if (zeebeLoop.inputCollection) {
      expressions.push({ element, expression: zeebeLoop.inputCollection });
    }

    if (zeebeLoop.outputElement) {
      expressions.push({ element, expression: zeebeLoop.outputElement });
    }
  }

  const completionConditionBody = loopCharacteristics.completionCondition?.body;

  if (typeof completionConditionBody === 'string' && completionConditionBody.trim()) {
    expressions.push({ element, expression: completionConditionBody });
  }
}

function collectEventDefinitionExpressions(element, expressions) {
  const conditionalEventDef = getEventDefinition(element, 'bpmn:ConditionalEventDefinition');

  if (conditionalEventDef) {
    const conditionBody = conditionalEventDef.condition?.body;

    if (typeof conditionBody === 'string' && conditionBody.trim()) {
      expressions.push({ element, expression: conditionBody });
    }
  }

  const timerEventDef = getEventDefinition(element, 'bpmn:TimerEventDefinition');

  if (timerEventDef) {
    const timerExpr = timerEventDef.timeDuration || timerEventDef.timeCycle || timerEventDef.timeDate;
    const timerBody = timerExpr?.body;

    if (typeof timerBody === 'string' && timerBody.trim()) {
      expressions.push({ element, expression: timerBody });
    }
  }

  const errorEventDef = getEventDefinition(element, 'bpmn:ErrorEventDefinition');

  if (errorEventDef?.errorRef?.errorCode) {
    expressions.push({ element, expression: errorEventDef.errorRef.errorCode });
  }

  const escalationEventDef = getEventDefinition(element, 'bpmn:EscalationEventDefinition');

  if (escalationEventDef?.escalationRef?.escalationCode) {
    expressions.push({ element, expression: escalationEventDef.escalationRef.escalationCode });
  }

  const signalEventDef = getEventDefinition(element, 'bpmn:SignalEventDefinition');

  if (signalEventDef?.signalRef?.name) {
    expressions.push({ element, expression: signalEventDef.signalRef.name });
  }
}

function collectZeebeExtensionExpressions(element, expressions) {
  const assignmentDef = getExtensionElementsList(element, 'zeebe:AssignmentDefinition')[0];

  if (assignmentDef) {
    for (const prop of [ 'assignee', 'candidateGroups', 'candidateUsers' ]) {
      if (assignmentDef[prop]) {
        expressions.push({ element, expression: assignmentDef[prop] });
      }
    }
  }

  const taskDef = getExtensionElementsList(element, 'zeebe:TaskDefinition')[0];

  if (taskDef) {
    if (taskDef.type) {
      expressions.push({ element, expression: taskDef.type });
    }

    if (taskDef.retries) {
      expressions.push({ element, expression: taskDef.retries });
    }
  }

  const taskSchedule = getExtensionElementsList(element, 'zeebe:TaskSchedule')[0];

  if (taskSchedule) {
    if (taskSchedule.dueDate) {
      expressions.push({ element, expression: taskSchedule.dueDate });
    }

    if (taskSchedule.followUpDate) {
      expressions.push({ element, expression: taskSchedule.followUpDate });
    }
  }

  const priorityDef = getExtensionElementsList(element, 'zeebe:PriorityDefinition')[0];

  if (priorityDef?.priority) {
    expressions.push({ element, expression: priorityDef.priority });
  }

  const calledElement = getExtensionElementsList(element, 'zeebe:CalledElement')[0];

  if (calledElement?.processId) {
    expressions.push({ element, expression: calledElement.processId });
  }

  const calledDecision = getExtensionElementsList(element, 'zeebe:CalledDecision')[0];

  if (calledDecision?.decisionId) {
    expressions.push({ element, expression: calledDecision.decisionId });
  }

  const adHoc = getExtensionElementsList(element, 'zeebe:AdHoc')[0];

  if (adHoc) {
    if (adHoc.activeElementsCollection) {
      expressions.push({ element, expression: adHoc.activeElementsCollection });
    }

    if (adHoc.outputElement) {
      expressions.push({ element, expression: adHoc.outputElement });
    }
  }
}

/**
 * Get event definition of a specific type from a flow element.
 *
 * @param {djs.model.Base} element
 * @param {string} eventDefinitionType
 * @returns {ModdleElement|undefined}
 */
function getEventDefinition(element, eventDefinitionType) {
  const eventDefinitions = element.eventDefinitions || [];
  return eventDefinitions.find(def => is(def, eventDefinitionType));
}

/**
 * Build consumed variables from pre-collected analysis results.
 *
 * @param {Array<{ origin: object, targetName: string, inputs: Array, expressionType: string }>} analysisResults
 * @returns {Array<ProcessVariable>} consumed variables
 */
function buildConsumedVariables(analysisResults) {
  const consumedVariables = {};
  const localUsages = [];
  const inputMappingTargetsCache = {};

  for (const { origin, targetName, inputs, expressionType } of analysisResults) {
    const availableLocalTargets = getAvailableLocalTargets(
      origin,
      expressionType,
      targetName,
      inputMappingTargetsCache
    );

    for (const inputVar of inputs) {

      // Output mappings should annotate local read usage but not create global
      // consumed variables.
      if (expressionType === 'output-mapping') {
        localUsages.push({
          variableName: inputVar.name,
          origin,
          targetName,
          expressionType
        });
        continue;
      }

      // Track locally-provided variables that are used by output expressions
      if (availableLocalTargets.has(inputVar.name)) {
        localUsages.push({
          variableName: inputVar.name,
          origin,
          targetName,
          expressionType
        });
        continue;
      }

      const key = `${inputVar.name}__${origin.id}`;

      if (!consumedVariables[key]) {
        consumedVariables[key] = {
          name: inputVar.name,
          origin: undefined,
          entries: inputVar.entries || [],
          usedBy: [ origin ],
          readFrom: [ expressionType ]
        };
      } else {
        if (!consumedVariables[key].usedBy.includes(targetName)) {
          consumedVariables[key].usedBy.push(targetName);
        }

        // Merge entries from the new input into the existing requirement
        // e.g. `a.b` and `a.c` should result in `a: {b, c}`
        if (inputVar.entries && inputVar.entries.length) {
          mergeEntries(consumedVariables[key], { entries: inputVar.entries });
        }

        if (!consumedVariables[key].readFrom.includes(expressionType)) {
          consumedVariables[key].readFrom.push(expressionType);
        }
      }
    }
  }

  return { consumed: Object.values(consumedVariables), localUsages };
}

/**
 * Get ordered input mapping target names for an element.
 *
 * @param {djs.model.Base} origin
 * @returns {Array<string>}
 */
function getInputMappingTargetNames(origin) {
  const ioMapping = getExtensionElementsList(origin, 'zeebe:IoMapping')[0];
  if (!ioMapping || !ioMapping.inputParameters) return [];
  return ioMapping.inputParameters.map(p => p.target);
}

function getAvailableLocalTargets(origin, expressionType, targetName, inputMappingTargetsCache) {
  const availableTargets = new Set();
  const scopes = [ origin, ...getParents(origin) ];

  for (const scope of scopes) {
    if (!inputMappingTargetsCache[scope.id]) {
      inputMappingTargetsCache[scope.id] = getInputMappingTargetNames(scope);
    }

    const orderedTargets = inputMappingTargetsCache[scope.id];

    // Input mappings on the current element are order-sensitive; ancestor
    // mappings are already established and fully available.
    if (scope === origin && expressionType === 'input-mapping') {
      const targetIndex = orderedTargets.indexOf(targetName);
      const availableOwnTargets = targetIndex === -1 ? orderedTargets : orderedTargets.slice(0, targetIndex);

      availableOwnTargets.forEach(target => availableTargets.add(target));
      continue;
    }

    orderedTargets.forEach(target => availableTargets.add(target));
  }

  return availableTargets;
}


