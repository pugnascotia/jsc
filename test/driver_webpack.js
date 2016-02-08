var assert = require('assert');
var cp = require('child_process');
var fs = require('fs');
var tmp = require('tmp');

function compile(args, cb) {

  // Needed or else uglification doesn't work
  var output = tmp.tmpNameSync({ postfix: '.js' });

  var cmd = `lib/cli.js -o ${output} ${args}`;

  cp.exec(cmd, { encoding: 'utf8' }, function(error, stdout, stderr) {

    if (error !== null) {
      assert.fail('Unexpected error: ' + stderr);
    }
    fs.readFile(output, { encoding: 'utf8' }, function(err, data) {
      assert.ok(err === null, 'Failed to read bundle output from temp file: ' + err);
      cb(data);
      fs.unlink(output);
    });
  });
}

describe('Webpack driver', function() {

  this.slow(3000);

  it('should require a single input file', function(done) {
    var cmd = 'lib/cli.js --bundle test/webpack/a.js test/webpack/b.js';
    cp.exec(cmd, { encoding: 'utf8' }, function(error, stdout, stderr) {
      assert.ok(error !== null && error.code === 1, 'Did not exit with 1');
      assert.equal(stderr.trim(), 'Error: --bundle requires a single file', 'Error message mismatch');
      done();
    });
  });

  it('should reject writing to stdout', function(done) {
    var cmd = 'lib/cli.js --bundle test/webpack/a.js';
    cp.exec(cmd, { encoding: 'utf8' }, function(error, stdout, stderr) {
      assert.ok(error !== null && error.code === 1, 'Did not exit with 1');
      assert.equal(stderr.trim(), 'Error: --bundle requires an output file', 'Error message mismatch');
      done();
    });
  });

  it('should generate a bundle', function(done) {
    var args = '--bundle test/webpack/a.js';

    compile(args, function(stdout) {
      assert.ok(/webpackBootstrap/.test(stdout), 'Output doesn\'t look like a bundle');
      done();
    });
  });

  it('should uglify bundles with --uglify', function(done) {
    var args = '--bundle --uglify test/webpack/a.js';

    compile(args, function(bundle) {
      assert.ok(/\/\/# sourceMappingURL=.*?\.js\.map$/.test(bundle.trim()), 'Output doesn\'t look like a bundle');
      done();
    });
  });

});
