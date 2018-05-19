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

function handleLinePublish({ connection, line }) {
  console.log('saving line to the db')
  r.table('lines')
  .insert(Object.assign(line, { timestamp: new Date() }))
  .run(connection);
}

function subscribeToSketchingLines({ client, connection, sketchingId}) {
  return r.table('lines')
  .filter(r.row('sketchingId').eq(sketchingId))
  .changes({ include_initial: true, include_types: true })
  .run(connection)
  .then((cursor) => {
    cursor.each((err, lineRow) => client.emit(`sketchingLine:${sketchingId}`, lineRow.new_val));
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

    client.on('publishLine', (line) => handleLinePublish({
      line,
      connection,
    }));

    client.on('subscribeToSketchingLines', (sketchingId) => {
      subscribeToSketchingLines({
        client,
        connection,
        sketchingId,
      });
    });
  });
});


const port = 8000;
io.listen(port);
console.log('listening on port ', port);

