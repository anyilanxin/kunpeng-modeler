import {
  createContext
} from 'preact';

/**
 * @typedef { {
 *   parserDialect?: import('@kunpeng/expression-editor').ParserDialect,
 *   builtins?: import('@kunpeng/expression-editor').Variable[],
 *   dialect?: import('@kunpeng/expression-editor').Dialect
 * } } FeelLanguageContextType
 */

/**
 * @type {import('preact').Context<FeelLanguageContextType>}
 */
const FeelLanguageContext = createContext({});

export default FeelLanguageContext;
