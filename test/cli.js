var assert = require('assert');
var cp = require('child_process');

describe('Command line processing', function() {

  describe('Running jsc', function() {
    it('without arguments should print help', function(done) {

      cp.exec('lib/cli.js', { encoding: 'utf8' }, (error, stdout, stderr) => {
        assert.equal(error.code, 1, 'Exit code mismatch');
        assert.equal(stderr.trim(), 'No input files specified', 'Error message mismatch');
        assert.ok(/Usage: jsc/.test(stdout), 'Usage not printed');
        done();
      });
    });
  });
});
