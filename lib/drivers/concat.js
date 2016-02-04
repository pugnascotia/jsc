var async = require('async');
var fs = require('fs');

function concat(files, config, cb) {
  async.waterfall([
    async.apply(read, files),
    async.apply(write, config.output)
  ], cb);
}

function read(files, cb) {
  async.mapSeries(
    files,
    fs.readFile,
    cb
  );
}

function write(destination, buffers, cb) {
  if (destination === '-') {
    process.stdout.write(Buffer.concat(buffers), 'utf8', cb);
  }
  else {
    fs.writeFile(
      destination,
      Buffer.concat(buffers),
      cb
    );
  }
}

module.exports = {
  compile: concat
};
