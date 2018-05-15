import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:8000');

function subscribeToSketchings(cb) {
  socket.on('sketching', sketching => cb(sketching));
  socket.emit('subscribeToSketchings');
}

function createSketching(name) {
  socket.emit('createSketching', { name });
}

export {
  createSketching,
  subscribeToSketchings,
};