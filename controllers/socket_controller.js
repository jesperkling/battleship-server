/**
 * Socket Controller
 */

const debug = require('debug')('battleships:socket_controller');
let io = null; // socket.io server instance

const players = []
const room = []

/**
 * Handle a user connecting
 * 
 */
const handleConnect = function(username) {
	debug(`${username} connected with id ${this.id} wants to join game`)
	console.log('users in beginning:', players)

	if (players.length > 1) {
		console.log('room is full')
		this.emit('game:full', true, (playersArray) => {
			playersArray = players
		})
		return
	}

	const player = {
		id: this.id,
		username: username,
	}

	players.push(player)

	this.broadcast.emit('username', player.username)
}

/**
 * Handle a user disconnecting
 *
 */
const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);

	const userLeaving = players.find((user) => user.id === this.id)

	if (userLeaving) {
		const usernameLeaving = players.find((user) => user.id === this.id).username

		if (usernameLeaving) {
			const userIndex = players.findIndex((user) => user.id === this.id)
			players.splice(userIndex, 1)

			this.broadcast.emit('player:disconnected', true)
		}
	}
}

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