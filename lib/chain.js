var duplexer2 = require('duplexer2'),
    Streamz = require('streamz'),
    toStream = require('./tostream');

module.exports = function(fn) {
  var inStream = Streamz(),
      outStream = Streamz();

  if (fn.length > 1)
    fn(inStream,outStream);
  else
    toStream(fn(inStream)).pipe(outStream);

  var stream = duplexer2({objectMode: true},inStream,outStream);

  // Mirror error and promise behaviour from streamz
  stream.on('error',function(e) {
    if (stream._events.error.length < 2) {
      var pipes = stream._readableState.pipes;
      if (pipes) [].concat(pipes).forEach(function(child) {
          child.emit('error',e);
        });
      else throw e;
    }
  });
  stream.promise = Streamz.prototype.promise;

  return stream;
};