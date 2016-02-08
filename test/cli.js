var assert = require('assert');
var cp = require('child_process');
var path = require('path');

var cli = require('../lib/cli.js');

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

  describe('Processing arguments', function() {
    it('should default output to "-"', function() {
      var result = cli.normalizeConfig({});

      assert.equal(result.output, '-', 'output not defaulted to "-"');
    });

    it('should normalize the output path', function() {
      var result = cli.normalizeConfig({output: 'src/main/output.js'});

      // Hack to ensure we have the correct expected path - it's the root
      // of the module, not the __dirname
      var expected = path.normalize(path.join(__dirname, '../src/main/output.js'));

      assert.equal(result.output, expected);
    });
  });

});
