import { expect } from 'chai';
import { has } from 'min-dash';


function isDefined(value) {
  return typeof value !== 'undefined';
}

function findVariable(variables, expectedVariable) {
  const {
    name,
    scope
  } = expectedVariable;

  const variable = variables.find(
    v => (!isDefined(name) || v.name === name) && (!isDefined(scope) || v.scope?.id === scope)
  );

  expect(variable, `variable[name=${name}, scope=${scope}]`).to.exist;

  return variable;
}

function assertVariableMatches(variable, expectedVariable) {

  const { name } = variable;

  if (has(expectedVariable, 'type')) {
    expect(variable.type, `variable[name=${name}].type`).to.eql(expectedVariable.type);
  }

  if (has(expectedVariable, 'info')) {
    expect(variable.info, `variable[name=${name}].info`).to.eql(expectedVariable.info);
  }

  if (has(expectedVariable, 'detail')) {
    expect(variable.detail, `variable[name=${name}].detail`).to.eql(expectedVariable.detail);
  }

  if (has(expectedVariable, 'scope')) {

    if (expectedVariable.scope) {
      expect(variable.scope, `variable[name=${name}].scope`).to.exist;
      expect(variable.scope.id, `variable[name=${name}].scope.id`).to.eql(expectedVariable.scope);
    } else {
      expect(variable.scope, `variable[name=${name}].scope`).not.to.exist;
    }
  }

  if (has(expectedVariable, 'isList')) {
    expect(!!variable.isList, `variable[name=${name}].isList`).to.eql(!!expectedVariable.isList);
  }

  if (has(expectedVariable, 'entries')) {
    expect(variable.entries, `variable[name=${name}].entries`).to.variableEqual(expectedVariable.entries);
  }

  if (has(expectedVariable, 'origin')) {

    if (expectedVariable.origin) {
      expect(variable.origin, `variable[name=${name}].origin`).to.exist;

      expectedVariable.origin.forEach((expectedId) => {
        const foundOrigin = variable.origin.find(e => e.id === expectedId);

        expect(foundOrigin, `variable[name=${name}] > origin[id=${expectedId}]`).to.exist;
      });

      expect(variable.origin.length, `variable[name=${name}].origin.length`).to.eql(expectedVariable.origin.length);
    } else {
      expect(variable.origin, `variable[name=${name}].origin`).not.to.exist;
    }
  }

  if (has(expectedVariable, 'usedBy')) {

    if (expectedVariable.usedBy) {
      expect(variable.usedBy, `variable[name=${name}].usedBy`).to.exist;

      expectedVariable.usedBy.forEach((expectedId) => {
        const foundUsedBy = variable.usedBy.find(e => e.id === expectedId);

        expect(foundUsedBy, `variable[name=${name}] > usedBy[id=${expectedId}]`).to.exist;
      });

      expect(variable.usedBy.length, `variable[name=${name}].usedBy.length`).to.eql(expectedVariable.usedBy.length);
    } else {
      expect(variable.usedBy, `variable[name=${name}].usedBy`).not.to.exist;
    }
  }
}

/**
 * Match variables against expected patterns,
 * return variables that were not matched.
 */
function assertVariablesMatch(variables, expectedVariables) {

  let remainingVariables = variables.slice();

  for (const expectedVariable of expectedVariables) {
    const variable = findVariable(remainingVariables, expectedVariable);

    remainingVariables = remainingVariables.filter(v => v !== variable);

    assertVariableMatches(variable, expectedVariable);
  }

  return remainingVariables;
}

function variableAssertions(chai, utils) {

  // use to verify that a list of variables
  // is complete, i.e. includes exactly the variables matched
  utils.addMethod(chai.Assertion.prototype, 'variableEqual', function(expectedVariables) {
    const variables = this._obj;

    const remainingVariables = assertVariablesMatch(variables, expectedVariables);

    expect(remainingVariables.length, `no additional variables, found [${remainingVariables.map(r => r.name)}]`).to.eql(0);
  });

  // use to verify that a list of variables
  // includes a single or a list of variables (by pattern)
  utils.addMethod(chai.Assertion.prototype, 'variableInclude', function(expectedVariables) {
    const variables = this._obj;

    if (!Array.isArray(expectedVariables)) {
      expectedVariables = [ expectedVariables ];
    }

    assertVariablesMatch(variables, expectedVariables);
  });
}

export {
  variableAssertions
};