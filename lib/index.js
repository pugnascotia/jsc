var webpack = require('./drivers/webpack');

function compile(filesToCompile, config, cb) {

  var driver;

  if (config.bundle) {
    driver = require('./drivers/webpack');
  }

  else {
    driver = require('./drivers/concat');
  }

  driver.compile(filesToCompile, config, cb);
}

module.exports = {
  compile: compile
};
