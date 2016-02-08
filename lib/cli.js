#! /usr/bin/env node

var chalk = require('chalk');
var glob  = require('glob');
var meow  = require('meow');
var path  = require('path');
var Q     = require('q');

var JSC = require('./index.js');

function normalizeConfig(inputConfig) {
  var config = Object.assign({ output: '-' }, inputConfig);

  if (config.output !== '-') {
    config.output = path.normalize(path.join(process.cwd(), config.output));
  }

  return config;
}

// The main functionality is extracted into a function to support testing.
function execute(compiler) {

  var cli = meow(`
Usage: jsc [options] files

Basic options:
  -h, --help    Display this message
  -o, --output  Output file. Pass '-' for stdout
  -v, --version Show version

General options:
  -u, --uglify  Uglify (minify) output

Bundle options:
  --bundle          Generate bundle using Webpack
  --bundle-less     Load LESS (and CSS) files. Default: true
  --watch           Watch for changes and dynamically regenerate the bundle
  --jsx             Use the JSX loader via Babel. Default: true
  --map             Generate source maps. Default: true
  --public-path     Specify public path for generated bundles
  --webpack-config  Use the specifed config instead of generating one

More information:

  Webpack - https://webpack.github.io/docs/
`, {
    alias: {
      h: 'help',
      o: 'output',
      u: 'uglify',
      v: 'version'
    },
    boolean: [ 'bundle', 'map', 'bundle-less', 'jsx', 'watch', 'uglify' ],
    string: [ 'public-path', 'webpack-config' ],
    default: {
      bundleLess: true,
      jsx: true,
      map: true,
      watch: false
    },
    unknown: function(opt) {
      if (opt.startsWith('-')) {
        console.warn(chalk.yellow('Ignoring unknown option ' + opt));
        return false;
      }

      return true;
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

      var config = normalizeConfig(cli.flags);

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
      console.error(chalk.red(err));
      process.exit(1);
    });
}


if (require.main === module) {
  execute(JSC);
}
else {
  module.exports = {
    execute: execute,
    normalizeConfig: normalizeConfig
  };
}
