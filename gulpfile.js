const gulp = require('gulp');
const less = require('gulp-less');
const nano = require('gulp-cssnano');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const through = require('through2');
const ts = require('gulp-typescript');
const vinyl = require('vinyl')
const path = require('path');
const sourcemaps = require('gulp-sourcemaps');
const merge = require('merge2');
const jsPath = './src/client/'
const dist = './dist/';
/**
 * https://github.com/gulp-sourcemaps/gulp-sourcemaps
 */
const sourceMapConfig = {
   sourceMappingURL: file => '/js/maps/' + file.relative + '.map'
}

const tsConfig = ts.createProject('tsconfig.browser.json');

// https://github.com/plus3network/gulp-less
// https://github.com/jonathanepollack/gulp-minify-css
// https://github.com/jakubpawlowicz/clean-css/blob/master/README.md
gulp.task('css', ()=>
   merge(
      gulp.src(lessPath(['map', 'mapbox', 'admin'])).pipe(less()).on('error', handleError),
      merge(
         // combine fonts with main styles
         gulp.src(lessPath(['ti'])).pipe(less()).on('error', handleError),
         gulp.src(dist + 'fonts/webfont.css')
      )
         .pipe(concat('ti.css'))
   )
      .pipe(less()).on('error', handleError)
      .pipe(nano({ discardUnused: false })).on('error', handleError)
      .pipe(gulp.dest(dist + 'css'))
);

// https://github.com/gulp-sourcemaps/gulp-sourcemaps
gulp.task('js', ()=> {
   return merge(
      tsConfig.src().pipe(tsConfig()),
      gulp.src(jsPath + 'jquery.lazyload.js')
   )  
      .pipe(bundle('post','static-map','lazyload').as('post', { keep: 'static-map' }))
      .pipe(bundle('static-map').as('category'))
      .pipe(sourcemaps.init())
      .pipe(uglify()).on('error', handleError)
      .pipe(sourcemaps.write('maps', sourceMapConfig))
      .pipe(gulp.dest(dist + 'js'));
});

function js(glob) {

}

// act on changes
gulp.task('watch', ()=> {
   gulp.watch('./src/less/*.less', ['css']);
   gulp.watch('./src/client/*.?s', ['js']);
});

//= Helper functions ==========================================================

/**
 * @param {string[]} names
 * @returns {string[]}
 */
const lessPath = names => names.map(n => './src/less/' + n + '.less');

/**
 * Handle error so file watcher can continue
 * @param {object} error
 * @see http://stackoverflow.com/questions/23971388/prevent-errors-from-breaking-crashing-gulp-watch
 */
function handleError(error) { console.error(error); this.emit('end'); }

/**
 * Bundle list of Javascript files as the target file. Source files are removed
 * from the stream and replaced by the target file unless listed in
 * options.keep.
 * 
 * Based on gulp-concat
 * @see https://github.com/contra/gulp-concat/blob/master/index.js
 */
const bundle = (...files) => ({
   as(target, options = {}) {
      const ext = '.js';
      // merged content
      let content = [];
      // files to keep in the stream after bundling
      let keep = [];
      // vinyl file used as template to create output file
      let template = null; 

      if (options.keep) {
         keep = Array.isArray(options.keep) ? options.keep : [options.keep];
      }

      // prevent "post" from matching post-menu.js
      files = files.map(f => f + ext);
      keep = keep.map(k => k + ext);
      target += ext;

      // file passed in callback is kept in stream.     
      function transform(file, enc, cb) {
         const name = file.basename ? file.basename : file.relative;
         if (files.find(f => name.indexOf(f) >= 0)) {
            content.push(file.contents);
            // use first file as template         
            if (template == null) { template = file; }
            // if not keeping file then empty callback removes it from stream
            if (keep.length == 0 || keep.find(k => name.indexOf(k) == -1)) {
               cb();
               return;
            }
         }
         cb(null, file)
      }

      // create merged file and place in stream
      // `this` refers to current stream (array of vinyl files).
      function finish(cb) {
         if (content.length > 0) {
            const merged = template.clone({ contents: false });
            merged.path = path.join(merged.base, target);
            merged.contents = Buffer.concat(content);
            this.push(merged);
         }
         cb();
      }

      return through.obj(transform, finish);
   }
});