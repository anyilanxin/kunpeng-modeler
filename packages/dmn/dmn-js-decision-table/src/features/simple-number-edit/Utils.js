import { keys } from 'min-dash';

const COMPARISON_REGULAR_EXPRESSION =
  /^(-?(?:\d|\.\d)+)$|^([<>=]{0,2})\s*(-?(?:\d|\.\d)+)$/;

const RANGE_REGULAR_EXPRESSION =
  /^(\[|\])(-?(?:\d|\.\d)+)+\.\.(-?(?:\d|\.\d)+)+(\[|\])$/;

export const operators = {
  equals: '==',
  less: '<',
  lessEquals: '<=',
  greater: '>',
  greaterEquals: '>=',
};

function getOperatorName(string) {
  return keys(operators).find((key) => {
    return string === operators[key];
  });
}

export function parseString(string) {
  if (!string || isEmptyString(string.trim())) {
    return {
      type: 'comparison',
    };
  }

  const comparisonMatches = string.match(COMPARISON_REGULAR_EXPRESSION);
  const rangeMatches = string.match(RANGE_REGULAR_EXPRESSION);

  if (comparisonMatches) {
    if (isNumber(comparisonMatches)) {
      return {
        type: 'comparison',
        value: Number.parseFloat(comparisonMatches[1]),
        operator: 'equals',
      };
    } else if (isComparison(comparisonMatches)) {
      return {
        type: 'comparison',
        value: Number.parseFloat(comparisonMatches[3]),
        operator: getOperatorName(comparisonMatches[2]),
      };
    }
  } else if (rangeMatches) {
    return {
      type: 'range',
      values: [rangeMatches[2], rangeMatches[3]].map((value) =>
        Number.parseFloat(value),
      ),
      start: rangeMatches[1] === ']' ? 'exclude' : 'include',
      end: rangeMatches[4] === '[' ? 'exclude' : 'include',
    };
  }
}

export function isEmptyString(string) {
  return string === '';
}

function isNumber(matches) {
  return matches[0] && matches[1] && !matches[2] && !matches[3];
}

function isComparison(matches) {
  return matches[0] && !matches[1] && matches[2] && matches[3];
}

export function getComparisonString(comparisonOperator, comparisonValue) {
  return comparisonOperator === 'equals'
    ? `==${comparisonValue}`
    : `${operators[comparisonOperator]} ${comparisonValue}`;
}

export function getRangeString(
  rangeStartValue,
  rangeEndValue,
  rangeStartType,
  rangeEndType,
) {
  const rangeEndChar = rangeEndType === 'exclude' ? '[' : ']';
  const rangeStartChar = rangeStartType === 'exclude' ? ']' : '[';

  return `${rangeStartChar}${rangeStartValue}..${rangeEndValue}${rangeEndChar}`;
}
