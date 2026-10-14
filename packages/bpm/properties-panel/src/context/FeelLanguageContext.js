import {
  createContext
} from 'preact';

/**
 * @typedef { {
 *   parserDialect?: import('@kunpeng-js/expression-editor').ParserDialect,
 *   builtins?: import('@kunpeng-js/expression-editor').Variable[],
 *   dialect?: import('@kunpeng-js/expression-editor').Dialect
 * } } FeelLanguageContextType
 */

/**
 * @type {import('preact').Context<FeelLanguageContextType>}
 */
const FeelLanguageContext = createContext({});

export default FeelLanguageContext;
