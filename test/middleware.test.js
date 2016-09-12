'use strict';

const C = require('../lib/constants');
const cache = require('../lib/cache');
const config = require('../lib/config');
const mocha = require('mocha');
const expect = require('chai').expect;
const res = require('./mocks/response.mock');
const req = require('./mocks/request.mock');
const middleware = require('../lib/middleware');

describe('Middleware', ()=> {
   beforeEach(() => {
      res.reset();
      req.reset();
   });

   describe('Block Spam Referers', ()=> {
      it('blocks black-listed URLs', done => {
         req.referer = 'http://2323423423.copyrightclaims.org';
         res.onEnd = error => {
            expect(error).is.undefined;
            expect(res.ended).is.true;
            expect(res.httpStatus).equals(C.httpStatus.NOT_FOUND);
            done();
         };
         middleware.blockSpamReferers(req, res, res.onEnd);
      });

      it('allows unlisted URLs', done => {
         req.referer = 'http://microsoft.com';
         res.onEnd = error => {
            expect(error).is.undefined;
            expect(res.httpStatus).not.equals(C.httpStatus.NOT_FOUND);
            done();
         };
         middleware.blockSpamReferers(req, res, res.onEnd);
      });

      it('caches black list', done => {
         res.onEnd = ()=> {
            cache.item(middleware.spamBlackListCacheKey).then(value => {
               expect(value).to.exist;
               expect(value).to.be.an('array');
               expect(value.length).at.least(100);
               done();
            });
         };
         middleware.blockSpamReferers(req, res, res.onEnd);
      });

      it.skip('refreshes the cache after a period of time', ()=> {
         // needs to call private method
      });
   });

   describe('Status Helpers', ()=> {
      // add helper expando methods
      before(done => { middleware.enableStatusHelpers(req, res, done); });

      it('finds referred client IP for hosted node instances', ()=> {
         req.connection.remoteAddress = 'remote';
         expect(req.clientIP()).equals('remote');

         req.headers['x-forwarded-for'] = 'value1, value2';
         expect(req.clientIP()).equals('value1');
      });
   });

   describe('View Cache', ()=> {
      const viewSlug = 'test-slug';
      const pageContent = '<html><head></head><body>Test Page</body></html>';

      config.cache.views = true;

      // remove any left-over test data and add caching expando methods
      before(done => {
         cache.view.remove(viewSlug).then(() => { middleware.enableViewCache(req, res, done); });
      });

      it('compresses new pages and adds to cache', done => {
         res.onEnd = ()=> {
            cache.view.item(viewSlug).then(item => {
               expect(item).to.exist;
               expect(item.eTag).to.contain(viewSlug);
               expect(item.buffer).to.have.length.above(250);
               done();
            });
         };
         res.sendView(viewSlug, render => {
            // mock response echoes back parameters instead of rendering view
            render('test-template', { option1: 'value1', option2: 'value2' });
         });
      });

      it('sends already rendered pages from cache', done => {
         res.onEnd = done;
         res.sendView(viewSlug, ()=> {
            throw new Error('Attempt to render page that should be cached');
         });
      });

      it('adds caching headers to compressed content', ()=> {
         const item = cache.view.create(viewSlug, pageContent);
         res.sendCompressed(C.mimeType.HTML, item);

         expect(res.headers['Cache-Control']).equals('max-age=86400, public');
         expect(res.headers['ETag']).to.contain(viewSlug);
         expect(res.content).equals(item.buffer);
      });

      // remove test page from cache
      after(() => res.removeFromCache(viewSlug));
   });
});