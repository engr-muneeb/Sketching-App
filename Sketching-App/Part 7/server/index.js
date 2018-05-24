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

function handleLinePublish({ connection, line, callback }) {
  console.log('saving line to the db')
  r.table('lines')
  .insert(Object.assign(line, { timestamp: new Date() }))
  .run(connection)
  .then(callback);
}

function subscribeToSketchingLines({ client, connection, sketchingId, from }) {
  let query = r.row('sketchingId').eq(sketchingId);

  if (from) {
    query = query.and(r.row('timestamp').ge(new Date(from)))
  }

  return r.table('lines')
  .filter(query)
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

    client.on('publishLine', (line, callback) => handleLinePublish({
      line,
      connection,
      callback,
    }));

    client.on('subscribeToSketchingLines', ({ sketchingId, from }) => {
      subscribeToSketchingLines({
        client,
        connection,
        sketchingId,
        from,
      });
    });
  });
});


const port = parseInt(process.argv[2], 10) || 8000;
io.listen(port);
console.log('listening on port ', port);

