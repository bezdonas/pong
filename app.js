/*
 *	Server
 */
var express = require('express'),
    app = express(),
    socket = require('socket.io');

app.configure(function () {
    app.use(express.static(__dirname + '/'));
});

var server = app.listen(80);

var io = socket.listen(server);



/*
 *  Game backend object
 */
var Pong = {
	// here we will keep sessions as socketId: socket
	sessions: {
		hanging: {}, // here will be sessions not in match
		fighting: {} // and this guys are already having fun
	},

	// object for matches
	matches: {},

	// counter of matches (for creating id's for this.matches)
	matchCounter: 0,

	// Game backend application
	app: (function(){
		var me = {}; // returned object

		// Initialization currently runs connectSocket()
		me.init = function() {
			me.connectSocket();
		};

		// This one opens socket connection, saves socket shortcuts in sessions object
		// and calls searchForMatches()
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
		// This one is circular, works until cleares out current
		// hanging sessions
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
		// moves sockets for players from Pong.hanging to Pong.fighting and
		// creates 
		me.arrangeMatch = function(id1, id2) {

			var ss = Pong.sessions; // shortcut for pong sessions

			// Transfer id's from hanging into fighting ones
			ss.fighting[players[1]] = ss.hanging[players[1]];
			ss.fighting[players[2]] = ss.hanging[players[2]];
			delete ss.hanging[players[1]];
			delete ss.hanging[players[2]];

			// Create new match in this.matches object

		};

		return me;
	}())
};


// Kick-off
Pong.app.init();
