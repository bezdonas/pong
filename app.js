// Server
var express = require('express'),
    app = express.createServer(),
    socket = require('socket.io');

app.configure(function () {
    app.use(express.static(__dirname + '/'));
});

var server = app.listen(81);

var io = socket.listen(server);


// Sockets
io.sockets.on('connection', function (socket) {
    console.log("connnect");

    // Client sent us position
	socket.on('positions', function (data) {
		Pong.positions = data;
	});


	// Client sent us actions
	socket.on('left', function() {
		Pong.positions.pad_1.left -= 10;
		if (Pong.positions.pad_1.left < 0) {
			Pong.positions.pad_1.left = 0;
		}
	});

	socket.on('right', function() {
		Pong.positions.pad_1.left += 10;
		if (Pong.positions.pad_1.left > 300) {
			Pong.positions.pad_1.left = 300;
		}
	});

	socket.on('start', function() {
	});


	// Resend positions once awhile
	setInterval(function(){
		socket.emit('positions', Pong.positions);
	}, 20);


    socket.on('disconnect', function (socket) {
        console.log("disconnect");
    });
});

// Game
Pong = {
	positions: {
		ball: {
			left: 0,
			top: 0
		},
		pad_1: {
			left: 0
		},
		pad_2: {
			left: 0
		}
	}
};