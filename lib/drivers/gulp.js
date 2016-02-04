var gulp    = require('gulp');
var concat  = require('gulp-concat');
var path    = require('path');
var through = require('through');
var uglify  = require('gulp-uglify');
var util    = require('gulp-util');

function runGulp(files, config, cb) {

  var stream = gulp.src(files);

  if (config.uglify) {
    stream.pipe(uglify().on('error', util.log));
  }

  stream.pipe(concat(path.basename(config.output), { newLine: ';' }));

  if (config.output === '-') {
    stream
      .pipe(through(function(data) { this.queue(data.contents); }))
      .pipe(process.stdout);
  }
  else {
    stream.pipe(gulp.dest(path.dirname(config.output)));
  }

  stream.on('error', function(err) {
    console.dir(err);
  });

  stream.on('end', function() {
    if (cb) {
      cb(); // callback to signal end of build
    }
  });
}

module.exports = {
  compile: runGulp
};
