function compile(filesToCompile, config, cb) {

  var driver;

  if (config.bundle) {
    driver = require('./drivers/webpack');
  }

  else {
    driver = require('./drivers/gulp');
  }

  driver.compile(filesToCompile, config, cb);
}

module.exports = {
  compile: compile
};
