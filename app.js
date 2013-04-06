/*
 *	Server
 */
var express = require('express'),
    app = express(),
    socket = require('socket.io');

app.configure(function () {
    app.use(express.static(__dirname + '/'));
});

var server = app.listen(81);

var io = socket.listen(server);



/*
 *  Game backend object
 */
var Pong = {
	// here we will keep sessions as socketId: socket
	sessions: {
		hanging: {}, // here will be sessions not in match
		fighting: {}, // and this guys are already having fun
		pairs: {} // and here we'll probably keep matching pairs
	},

	// Game backend application
	app: (function(){
		var me = {}; // returned object

		// Initialization currently runs connectSocket()
		me.init = function() {
			me.connectSocket();
		};

		// This one opens socket connection, saves socket shortcuts in sessions object
		// and calls arrangeMatch if there are more than two connections
		me.connectSocket = function() {
			io.sockets.on('connection', function (socket) {

				Pong.sessions.hanging[socket.id] = socket; // add the session data to sessions object

				me.searchForMatches();

				socket.on('disconnect', function () {
					// remove the session from the object whether it is in fight or no
					delete Pong.sessions.fighting[socket.id];
					delete Pong.sessions.hanging[socket.id];
					me.searchForMatches();
				});

			});
		};

		// Looks if we have hanging pair for match now
		// This one is circular
		me.searchForMatches = function() {
			var arr = []; // here we'll keep array of hanging id's

			// push ids into array
			for (key in Pong.sessions.hanging) {
				arr.push(key);
			}

			// calls arrangeMatch() if there is more than one hanging player
			if (arr.length === 1) {
				// one session, tell him to wait
				Pong.sessions.hanging[arr[0]].emit('log', 'Wait for opponent');
				return false;
			} else if (arr.length === 2) {
				// two sessions, let them fight each other
				me.arrangeMatch(arr[0], arr[1]);
				return false;
			} else if (arr.length > 2) {
				// more than two, arrange fight between two and do this function again
				me.arrangeMatch(arr[0], arr[1]);
				me.searchForMatches();
			}

		};

		// arranges match. id1 and id2 are rival's session id (kept in Pong.sessions object)
		me.arrangeMatch = function(id1, id2) {

			var ss = Pong.sessions; // shortcut for pong sessions

			// Transfer id's from hanging into fighting ones
			ss.fighting[id1] = ss.hanging[id1];
			ss.fighting[id2] = ss.hanging[id2];
			delete ss.hanging[id1];
			delete ss.hanging[id2];

			// Shortcuts for fighting sockets
			var socket1 = ss.fighting[id1],
				socket2 = ss.fighting[id2],
				// that is for keeping keymaps
				keyMap1 = {},
				keyMap2 = {},
				// readiness
				ready1: false,
				ready2: false,
				// provide broadcast for this to id's
				broadcast = function(name, data) {
					socket1.emit(name, data);
					socket2.emit(name, data);
				},
				// key map reader
				keyMapReader = function() {
				};

			broadcast('log', 'Press spacebar when you\'ll be ready to play');
			
			socket1.on('keyInfo', function(data) {
				keyMap1 = data;
				keyMapReader();
			});

			socket2.on('keyInfo', function(data) {
				keyMap2 = data;
				keyMapReader();
			});

		};

		return me;
	}())
};


// Kick-off
Pong.app.init();
