const r = require('rethinkdb');
const io = require('socket.io')();

function createSketching({ connection, name }) {
  return r.table('sketchings')
  .insert({
    name,
    timestamp: new Date(),
  })
  .run(connection)
  .then(() => console.log('created a new sketching with name ', name));
}

function subscribeToSketchings({ client, connection }) {
  r.table('sketchings')
  .changes({ include_initial: true })
  .run(connection)
  .then((cursor) => {
    cursor.each((err, sketchingRow) => client.emit('sketching', sketchingRow.new_val));
  });
}


r.connect({
  host: 'localhost',
  port: 28015,
  db: 'awesome_whiteboard'
}).then((connection) => {
  io.on('connection', (client) => {
    client.on('createSketching', ({ name }) => {
      createSketching({ connection, name });
    });

    client.on('subscribeToSketchings', () => subscribeToSketchings({
      client,
      connection,
    }));
  });
});


const port = 8000;
io.listen(port);
console.log('listening on port ', port);
