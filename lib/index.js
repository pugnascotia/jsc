var chalk = require('chalk');
var fs    = require('fs');
var path  = require('path');

function generateBundle(entryPoint, config, cb) {
  var webpack = require('webpack');

  var webpackConfig;

  if (config.webpackConfig) {
    webpackConfig = fs.readFileSync(config.webpackConfig, { encoding: 'utf8' });
  }
  else {
    var sourceDir = path.dirname(entryPoint);

    webpackConfig = {
      entry: sourceDir,
      resolve: {
        extensions: ['', '.js', '.jsx' ]
      },
      output: {
        path: path.dirname(config.output),
        filename: path.basename(config.output)
      },
      module: {
        loaders: []
      },
      plugins: []
    };

    if (config.map) {
      webpackConfig.devtool = 'source-map';
    }

    if (config.publicPath) {
      webpackConfig.output.publicPath = config.publicPath;
    }
    else {
      console.warn(chalk.yellow('No path specified with --public-path. You might need that for webapps'));
    }

    if (config.jsx) {
      webpackConfig.module.loaders.push({
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: sourceDir
      });
    }

    if (config.bundleLess) {
      webpackConfig.module.loaders.push({
        test: /\.(?:css|less)$/,
        loader: 'style-loader!css-loader!less-loader'
      });
    }

    if (config.devServer) {
      webpackConfig.devServer = {
        port: 9090,
        proxy: {
          '/*': {
            target: 'http://localhost:8080',
            secure: false,
            // node-http-proxy option - don't add /localhost:8080/ to proxied request paths
            prependPath: false
          }
        },
        publicPath: 'http://localhost:9090' + (config.publicPath || '')
      };
    }
  }

  var wpCompiler = webpack(webpackConfig);

  wpCompiler.run(function(err, stats) {
    if (err) {
      cb(err);
    }

    var jsonStats = stats.toJson();

    jsonStats.warnings.forEach(function(e) {
      console.warn(chalk.yellow('Warning: ' + e));
    });

    cb(jsonStats.errors.length > 0 ? jsonStats.errors : null);
  });
}

function concatenate(files, config, cb) {
  var IO = require('./io');
  IO.concat(files, config.output, cb);
}

function compile(filesToCompile, config, cb) {

  if (config.bundle) {
    if (filesToCompile.length !== 1) {
      throw new Error('--bundle requires a single file');
    }

    generateBundle(filesToCompile[0], config, cb);
  }

  else {
    concatenate(filesToCompile, config, cb);
  }
}

module.exports = {
  compile: compile
};
