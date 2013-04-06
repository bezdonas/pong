/*
 *	Front-end Pong game app
 *	@author Aliev Ramil
 *	@email bezdonas@gmail.com
 */

// Game frontend object
var Pong = {
	// key
	keyMap: {
		37: 'left', // left arrow
		39: 'right', // right arrow
		32: 'start' // space
	},

	// here we'll keep info about key status (1 - pressed, 0 - not pressed)
	keyInfo: {
		'left': 0,
		'right': 0,
		'start': 0
	},

	// Game frontend application
	app: (function(){
		var me = {}; // returned object

		// jQuery objects
		var doc = $(document),
			wrap = $('#pong-game'),
			ball = $('#pong-game_ball'),
			pad_1 = $('#pong-game_pad-1'),
			pad_2 = $('#pong-game_pad-2'),
			log = $('#log');

		// Other vars
		var socket;

		me.init = function() {
			me.socketStart();
			me.keyEvents();
		};

		me.socketStart = function() {
			socket = io.connect();
			socket.on('log', function(data) {
				log.append(data, '<br/>');
			});
			socket.on('process', function(data) {
				me.process(data);
			});
		};

		me.keyEvents = function() {
			doc.on('keydown keyup', function(event) {
				var key = '' + event.which, // key code in string
					keyMap = Pong.keyMap, // shortcut
					keyInfo = Pong.keyInfo; // shortcut
				// this provides actual information in keyMap and sending it to socket onchange
				if (keyMap[key] !== undefined) {
					keyInfo[keyMap[key]] = event.type === 'keydown' ? 1 : 0;
					socket.emit('keyInfo', keyInfo);
					return false
				}
			});
		};

		me.process = function(data) {
		};

		return me;
	}())
};


// Kick-off
Pong.app.init();