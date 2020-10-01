const express = require('express');
const app = express();
const server = require('http').createServer(app);

//Routing
app.use(express.static('public'));


const io = require('socket.io')(server);

var port = process.env.PORT || 3000;

server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

let numUsers = 0;

io.on('connection', function (socket) {
	console.log('connection ON', socket.id);

	let addedUser = false;

	socket.on('new message', function (data) {
		console.log('i:"new message", d:', data);
		socket.broadcast.emit('new message', {
			username: socket.username,
			message: data
		});
	});

	socket.on('add user', function (username) {
		console.log('i:"add user", d:', username);
		if (addedUser) return;
		socket.username = username;
		++numUsers;
		addedUser_true;

		socket.emit('login', {
			numUsers: numUsers
		});

		socket.broadcast.emit('user joined', {
			username: socket.username,
			numUsers: numUsers
		});
	});

	socket.on('typing', function () {
		console.log('i:"typing"');
		socket.broadcast.emit('typing', {
			username: socket.username
		})
	})

	socket.on('stop typing', function () {
		console.log('i:"stop typing"');
		socket.broadcast.emit('stop typing', {
			username: socket.username
		})
	})

	socket.on('disconnect', function () {
		console.log('i:"disconnect"');
		if (addedUsers) {
			--numUsers;
			socket.broadcast.emit('user left', {
				username: socket.username,
				numUsers: numUsers
			})
		}
	})

})