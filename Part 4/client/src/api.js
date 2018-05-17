import openSocket from 'socket.io-client';
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
  socket.on(`sketchingLine:${sketchingId}`, line => cb(line));
  socket.emit('subscribeToSketchingLines', sketchingId);
}

export {
  publishLine,
  createSketching,
  subscribeToSketchings,
  subscribeToSketchingLines,
};