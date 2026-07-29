import { addComment } from '../../formatHelpers/createPropertyFormatter.js';
import { commentStyles, commentPositions } from '../../../enums/index.js';

/**
 * Check whether a Sass value contains a comma outside quotes and brackets.
 * Such values need grouping when used as a map value, otherwise Sass parses
 * each comma-separated item as another map entry.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function hasTopLevelComma(value) {
  const stringValue = `${value}`;
  let quote;
  let escaped = false;
  let depth = 0;

  for (const character of stringValue) {
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === quote) {
        quote = undefined;
      }
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '(' || character === '[' || character === '{') {
      depth += 1;
    } else if (character === ')' || character === ']' || character === '}') {
      depth = Math.max(0, depth - 1);
    } else if (character === ',' && depth === 0) {
      return true;
    }
  }

  return false;
}

/**
 * @typedef {import('../../../../types/DesignToken.d.ts').TransformedToken} TransformedToken
 * @typedef {import('../../../../types/Config.d.ts').Config} Config
 * @typedef {import('../../../../types/Config.d.ts').LocalOptions} LocalOptions
 */

/**
 * @param {{
 *   allTokens: TransformedToken[]
 *   options: Config & LocalOptions
 *   header: string
 * }} opts
 */
export default ({ allTokens, options, header }) => {
  const _f = options.formatting ?? {};
  const f = {
    ..._f,
    indentation: _f.indentation ?? '  ',
    commentStyle: _f.commentStyle ?? commentStyles.short,
    commentPosition: _f.commentPosition ?? commentPositions.above,
  };
  return `
${header}$${options.mapName ?? 'tokens'}: (\n${allTokens
    .map((token, i, arr) => {
      const value = options.usesDtcg ? token.$value : token.value;
      const formattedValue = hasTopLevelComma(value) ? `(${value})` : value;
      const tokenString = `${f.indentation}'${token.name}': ${formattedValue}${
        i !== arr.length - 1 ? ',' : ''
      }`;
      if (token.comment && f.commentStyle !== commentStyles.none) {
        return addComment(tokenString, token.comment, f);
      }
      return tokenString;
    })
    .join(`\n`)}\n);`;
};
