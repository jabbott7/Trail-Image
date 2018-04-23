import { env } from '@toba/tools';
import { Token } from '@toba/oauth';
import { GoogleConfig } from '@trailimage/google-provider';
import { domain } from './models';

/**
 * @see http://code.google.com/apis/console/#project:1033232213688
 */
export const mapProvider: GoogleConfig = {
   apiKey: env('GOOGLE_DRIVE_KEY'),
   folderID: '0B0lgcM9JCuSbMWluNjE4LVJtZWM',
   cacheSize: 2048,
   useCache: true,
   auth: {
      clientID: env('GOOGLE_CLIENT_ID'),
      secret: env('GOOGLE_SECRET'),
      callback: 'http://www.' + domain + '/auth/google',
      token: {
         type: null,
         access: env('GOOGLE_ACCESS_TOKEN', null),
         accessExpiration: null as Date,
         refresh: env('GOOGLE_REFRESH_TOKEN', null)
      } as Token
   }
};