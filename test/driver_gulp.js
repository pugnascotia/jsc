var assert = require('assert');
var cp = require('child_process');
var compiler = require('../lib/index.js');

function compile(args, cb) {
  cp.exec('lib/cli.js ' + args, { encoding: 'utf8' }, function(error, stdout, stderr) {
    assert.ok(error == null, 'Exited non-zero');
    cb(stdout);
  });
}

describe('Gulp driver', function() {

  // As these tests involve forking and exec'ing, be a little more
  // generous about timing.
  this.slow(1000);

  it('should concatenate multiple files', function(done) {

    var args = 'test/gulp/a.js test/gulp/b.js';

    compile(args, function(stdout) {
      assert.equal(stdout.trim(), "'a';\n'b';");
      done();
    });
  });

  it('should uglify the output', function(done) {

    var args = '-u test/gulp/c.js test/gulp/d.js';

    compile(args, function(stdout) {
      assert.equal(stdout.trim(), 'var longFunctionName=function(n){console.log(n)};longFunctionName("a string");');
      done();
    });
  });

});
