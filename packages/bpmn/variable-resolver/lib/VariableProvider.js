/**
 * @typedef Variable
 * @property {string} name The name of the variable
 * @property {string} [type] The type of the variable
 * @property {string} [info] A description of the variable displayed as a tooltip
 * @property {boolean} [isList] whether the variable is a list
 * @property {Array<Variable>} [entries] If the variable is a context, this contains the entries of the context
 * @property {djs.model.Base} [scope] The scope of the variable, by default it is the container element of the element the variable is created from
 */

/**
 * A basic provider that may be extended to provide variables for the variable resolver.
 *
 * Extensions should implement the method `getVariables`.
 */
export default class VariableProvider {
  constructor(variableResolver) {
    this._variableResolver = variableResolver;
    this.register();
  }

  /**
   * This method should implement the creation of a list of process variables.
   *
   * @param {djs.model.Base} element
   * @return {Array<Variable>} a list of process variables
   *
   * The following example contains one variable
   *
   * @example
   * VariableProvider.getVariables = function(element) {
   *   const variables = [
   *     {
   *       name: 'myVariable',
   *       type: 'String',
   *       info: 'This is a global variable'
   *     }
   *   ];
   *
   *   if (is(element, 'bpmn:Process')) {
   *     return variables;
   *   }
   * }
   */
  getVariables(element) { }

  register() {
    this._variableResolver.registerProvider(this);
  }
}

VariableProvider.$inject = [ 'variableResolver' ];