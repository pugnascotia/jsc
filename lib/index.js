var generateBundle = require('./webpack');

function compile(filesToCompile, config, cb) {

  if (config.bundle) {
    if (filesToCompile.length !== 1) {
      throw new Error('--bundle requires a single file');
    }

    generateBundle(filesToCompile[0], config, cb);
  }

  else {
    var IO = require('./io');
    IO.concat(filesToCompile, config.output, cb);
  }
}

module.exports = {
  compile: compile
};
