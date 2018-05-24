import openSocket from 'socket.io-client';
import Rx from 'rxjs/Rx';
import createSync from 'rxsync';

const port = parseInt(window.location.search.replace('?', ''), 10) || 8000;
const socket = openSocket(`http://localhost:${port}`);

function subscribeToSketchings(cb) {
  socket.on('sketching', sketching => cb(sketching));
  socket.emit('subscribeToSketchings');
}

function createSketching(name) {
  socket.emit('createSketching', { name });
}

const sync = createSync({
  maxRetries: 10,
  delayBetweenRetries: 1000,
  syncAction: line => new Promise((resolve, reject) => {
    let sent = false;

    socket.emit('publishLine', line, () => {
      sent = true;
      resolve();
    });

    setTimeout(() => {
      if (!sent) {
        reject();
      }
    }, 2000);
  }),
});

sync.failedItems.subscribe(x => console.error('failed line sync: ', x));
sync.syncedItems.subscribe(x => console.log('successful line sync: ', x));


function publishLine({ sketchingId, line }) {
  sync.queue({ sketchingId, ...line });
}

function subscribeToSketchingLines(sketchingId, cb) {

  const lineStream = Rx.Observable.fromEventPattern(
    h => socket.on(`sketchingLine:${sketchingId}`, h),
    h => socket.off(`sketchingLine:${sketchingId}`, h),
  );

  const bufferedTimeStream = lineStream
  .bufferTime(100)
  .map(lines => ({ lines }));

  const reconnectStream = Rx.Observable.fromEventPattern(
    h => socket.on('connect', h),
    h => socket.off('connect', h),
  );

  const maxStream = lineStream.map(l => new Date(l.timestamp).getTime()).scan((a, b) => ((a > b) ? a : b), 0);

  reconnectStream
  .withLatestFrom(maxStream)
  .subscribe((joined) => {
    const lastReceivedTimestamp = joined[1];
    socket.emit('subscribeToSketchingLines', { sketchingId, from: lastReceivedTimestamp });
  });




  bufferedTimeStream.subscribe(linesEvent => cb(linesEvent));
  socket.emit('subscribeToSketchingLines', { sketchingId });
}


function subscribeToConnectionEvent(cb) {
  socket.on('connect', () => cb({ state: 'connected', port }));
  socket.on('disconnect', () => cb({ state: 'disconnected', port }));
  socket.on('connect_error', () => cb({ state: 'disconnected', port }));
}

export {
  publishLine,
  createSketching,
  subscribeToSketchings,
  subscribeToSketchingLines,
  subscribeToConnectionEvent,
};