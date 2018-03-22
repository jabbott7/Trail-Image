import is from '../is';
import re from '../regex';
import * as url from 'url';

export { format, capitalize, titleCase, slug, rot13 } from '@toba/tools';

// http://www.hacksparrow.com/base64-encoding-decoding-in-node-js.html
export const decodeBase64 = (text: string) =>
   new Buffer(text, 'base64').toString();
export const encodeBase64 = (text: string) =>
   new Buffer(text).toString('base64');

/**
 * Infer top level domain from URL.
 *
 * https://github.com/igormilla/top-domain
 */
export const topDomain = (address: string) => {
   const parsed = url.parse(address.toLowerCase());
   const domain = parsed.host !== null ? parsed.host : parsed.path;
   const match = domain.match(re.domain);

   return match ? match[0] : parsed.host;
};
