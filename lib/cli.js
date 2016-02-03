#! /usr/bin/env node

var chalk = require('chalk');
var glob  = require('glob');
var meow  = require('meow');
var path  = require('path');
var Q     = require('q');

var JSC = require('./index.js');

var cli = meow(`
    Usage
      $ jsc [options] files...

    Options:
      -h, --help    Display this message
      -o, --output  Output file. Pass '-' for stdout
      -v, --version Show version

    Bundle options:
      --bundle          Generate webpack bundle
      --bundle-less     Load LESS (and CSS) files. Default: true
      --dev-server      Apply dev server configuration. Default: true
      --jsx             Use the JSX loader via Babel. Default: true
      --map             Generate source maps. Default: true
      --public-path     Specify public path for generated bundles
      --webpack-config  Use the specifed config instead of generating
`, {
  alias: {
    h: 'help',
    o: 'output',
    v: 'version'
  },
  boolean: [ 'bundle', 'map', 'bundle-less', 'jsx' ],
  string: [ 'public-path', 'webpack-config' ],
  default: {
    devServer: true,
    bundleLess: true,
    jsx: true,
    map: true
  },
  unknown: function(opt) {
    console.warn(chalk.yellow('Ignoring unknown option ' + opt));
    return false;
  }
});

if (cli.input.length === 0) {
  console.warn(chalk.yellow('No input files specified'));
  cli.showHelp(1);
}

var promises = cli.input.map(function(pattern) {
  return Q.nfcall(glob, pattern);
});

Q.all(promises)
  .then(function (results) {

    var allFiles = results.reduce(function(prev, next) {
      return prev.concat(next);
    })
    .map(function(each) {
      return path.normalize(path.join(process.cwd(), each));
    });

    if (allFiles.length === 0) {
      console.warn(chalk.red('No files to process'));
      process.exit(1);
    }

    var config = Object.assign({ output: '-' }, cli.flags);

    if (config.output !== '-') {
      config.output = path.normalize(path.join(process.cwd(), config.output));
    }

    JSC.compile(allFiles, config, function(err) {
      if (err) {
        if (Array.isArray(err)) {
          err.forEach(function(e) { console.warn(chalk.red(e)); });
        }
        else {
          console.warn(chalk.red(err));
        }
        process.exit(1);
      }
    });
  })
  .catch(function (err) {
    console.warn(chalk.red(err));
    process.exit(1);
  });
