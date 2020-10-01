const express = require('express');
const app = express();
const server = require('http').createServer(app);

//Routing
app.use(express.static('public'));
const io = require('socket.io')(server);
var port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log('Server listening at port %d', port);
});

let numUsers = 0;
let addedUser = false;

io.on('connection', function(socket) {
  console.log('connection ON', socket.id);
  addedUser = false;
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function(data) {
    console.log('i:"new message", d:', data);
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  socket.on('add user', function(username) {
    console.log('i:"add user", d:', username);
    if (addedUser) return;
    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function() {
    console.log('i:"typing"');
    socket.broadcast.emit('typing', {
      username: socket.username
    })
  })

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function() {
    console.log('i:"stop typing"');
    socket.broadcast.emit('stop typing', {
      username: socket.username
    })
  })

  // when the user disconnects.. perform this
  socket.on('disconnect', function() {
    console.log('i:"disconnect"');
    if (addedUser) {
      --numUsers;
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      })
    }
  })
})