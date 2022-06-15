/**
 * Socket Controller
 */

const debug = require('debug')('battleships:socket_controller');
let io = null; // socket.io server instance

const players = []

/**
 * Handle a user connecting
 * 
 */
const handleConnect = function(username) {
	debug(`${username} connected with id ${this.id} wants to join game`)

	const player = {
		id: this.id,
		username: username,
		ready: false,
		ships: {},
	}

	players[this.id] = username
	players.push(player)

	console.log(player.username)

	this.broadcast.emit('username', player.username)
}

/**
 * Handle a user disconnecting
 *
 */
const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);
}

// /**
//  * Handle clock start
//  *
//  */
// const handleClockStart = function() {
// 	debug(`Client ${this.id} wants to start the clock`);

// 	// tell everyone connected to start their clocks
// 	io.emit('clock:start')
// }

// /**
//  * Handle clock stop
//  *
//  */
// const handleClockStop = function() {
// 	debug(`Client ${this.id} wants to stop the clock`);

// 	// tell everyone connected to stop their clocks
// 	io.emit('clock:stop')
// }

// /**
//  * Handle clock reset
//  *
//  */
// const handleClockReset = function() {
// 	debug(`Client ${this.id} wants to reset the clock`);

// 	// tell everyone connected to reset their clocks
// 	io.emit('clock:reset')
// }

/**
 * Export controller and attach handlers to events
 *
 */
module.exports = function(socket, _io) {
	// save a reference to the socket.io server instance
	io = _io;

	debug(`Client ${socket.id} connected`)
	socket.on('player:username', handleConnect)

	// handle user disconnect
	socket.on('disconnect', handleDisconnect);

	// // listen for 'clock:start' event
	// socket.on('clock:start', handleClockStart)

	// // listen for 'clock:stop' event
	// socket.on('clock:stop', handleClockStop)

	// // listen for 'clock:reset' event
	// socket.on('clock:reset', handleClockReset)
}