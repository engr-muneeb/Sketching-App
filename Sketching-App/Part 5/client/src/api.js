import openSocket from 'socket.io-client';
import Rx from 'rxjs/Rx';
const socket = openSocket('http://localhost:8000');

function subscribeToSketchings(cb) {
  socket.on('sketching', sketching => cb(sketching));
  socket.emit('subscribeToSketchings');
}

function createSketching(name) {
  socket.emit('createSketching', { name });
}

function publishLine({ sketchingId, line }) {
  socket.emit('publishLine', { sketchingId, ...line });
}

function subscribeToSketchingLines(sketchingId, cb) {

  const lineStream = Rx.Observable.fromEventPattern(
    h => socket.on(`sketchingLine:${sketchingId}`, h),
    h => socket.off(`sketchingLine:${sketchingId}`, h),
  );

  const bufferedTimeStream = lineStream
  .bufferTime(100)
  .map(lines => ({ lines }));

  bufferedTimeStream.subscribe(linesEvent => cb(linesEvent));
  socket.emit('subscribeToSketchingLines', sketchingId);
}

export {
  publishLine,
  createSketching,
  subscribeToSketchings,
  subscribeToSketchingLines,
};
