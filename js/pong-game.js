/*
 *	@author Aliev Ramil
 *	@email bezdonas@gmail.com
 */


// Game object
var Pong = {};


// Game parameters, some of them need to be also edited in styl(css)
Pong.params = {
	wrap: {
		width: 400,
		height: 600
	},
	ball: {
		width: 10,
		height: 10
	},
	pad: {
		width: 100,
		height: 10
	},
	frameRate: 30,
	keys: {
		37: 'left', // left arrow
		39: 'right', // right arrow
		32: 'start' // space
	}
};


// Game objects default position (will be resent by server while playing)
Pong.positions = {
	ball: {
		left: Pong.params.wrap.width / 2 - Pong.params.ball.width / 2,
		top: Pong.params.wrap.height / 2 - Pong.params.ball.height / 2
	},
	pad_1: {
		left: Pong.params.wrap.width / 2 - Pong.params.pad.width / 2
	},
	pad_2: {
		left: Pong.params.wrap.width / 2 - Pong.params.pad.width / 2
	}
};


/*
	This module connects to socket and sends starting positions to it.
	It also registers keypresses and sends them to socket as well.
	Once a while it applies position of pads and ball from Pong.positions object.
	That's all: game logic runs on the server.
*/
Pong.app = (function(){
	var me = {}; // returned object

	// jQuery objects
	var wrap = $('#pong-game'),
		ball = $('#pong-game_ball'),
		pad_1 = $('#pong-game_pad-1'),
		pad_2 = $('#pong-game_pad-2');

	// Other vars
	var intervalWrap, socket,
		interval = 1000 / Pong.params.frameRate,
		keys = Pong.params.keys;

	me.init = function() {
		me.socketStart();
		me.registerKeypresses();
		me.reflow();
	};

	me.reflow = function() {
		// this interval applies css settings from Pong.positions
		// to jQuery objects from this module
		intervalWrap = setInterval(function() {

			ball.css(Pong.positions.ball);
			pad_1.css(Pong.positions.pad_1);
			pad_2.css(Pong.positions.pad_2);

		}, interval);
	};

	me.socketStart = function() {
		// connect
		socket = io.connect();

		// send server start positions
		socket.emit('positions', Pong.positions);

		// this event sends us new positions from server
		socket.on('positions', function (data) {
			Pong.positions = data;
		});	
	};

	me.registerKeypresses = function() {
		$(document).on('keydown', function(e) {
			var key = e.keyCode;
			if (keys[key]) {
				socket.emit(keys[key]);
				return false;
			}

		});
	};

	return me;
})();


// Kick-off
Pong.app.init();