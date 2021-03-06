var chalk   = require('chalk');
var fs      = require('fs');
var path    = require('path');
var webpack = require('webpack');

function generateConfig(entryPoint, config) {
  var sourceDir = path.dirname(entryPoint);

  var webpackConfig = {
    entry: entryPoint,
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

  if (config.uglify) {
    webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
      sourceMap: config.map
    }));
  }

  if (config.watch) {
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

  return webpackConfig;
}

function generateBundle(filesToCompile, config, cb) {

  if (filesToCompile.length !== 1) {
    throw new Error('--bundle requires a single file');
  }

  if (config.output === '-') {
    // https://github.com/webpack/docs/wiki/webpack-for-browserify-users
    throw new Error('--bundle requires an output file');
  }

  var entryPoint = filesToCompile[0];

  var webpackConfig = config.webpackConfig ?
    fs.readFileSync(config.webpackConfig, { encoding: 'utf8' }) :
    generateConfig(entryPoint, config);

  var wpCompiler = webpack(webpackConfig);

  if (config.watch) {
    var watcher;
    watcher = wpCompiler.watch({}, function (err, stats) {
      if (err) {
        watcher.close(function() {
          cb.err();
        });
      }

      var jsonStats = stats.toJson();

      jsonStats.warnings.forEach(function(e) {
        console.warn(chalk.yellow('Warning: ' + e));
      });
      jsonStats.errors.forEach(function(e) {
        console.warn(chalk.red('Warning: ' + e));
      });

      if (jsonStats.errors.length === 0) {
        console.log('Generated bundle in ' + (jsonStats.time / 1000) + 's');
      }
    });
  }
  else {
    wpCompiler.run(function (err, stats) {
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
}

module.exports = {
  compile: generateBundle
};
