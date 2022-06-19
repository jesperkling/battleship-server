/**
 * Socket Controller
 */

const debug = require('debug')('battleships:socket_controller');
let io = null; // socket.io server instance

let players = []

/**
 * Handle a user connecting
 * 
 */
const handleConnect = function(username) {
	debug(`${username} connected with id ${this.id} wants to join game`)
	console.log('users in beginning:', players)

	if (players.length <= 1) {

		const player = {
			id: this.id,
			username: username,
		}

		players.push(player)

		this.broadcast.emit('username', player.username)
	} else {
		console.log('Room is full, amount of players currently:', players)

		this.emit('game:full', true, (playersArray) => {
			playersArray = players
		})

		delete this.id
		return
	}
}

/**
 * Handle a user disconnecting
 *
 */
const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);

	if (this.id) {
		this.broadcast.emit('player:disconnected', true)
	}

	delete this.id
	players = []

}

/**
 * Handle hit
 * 
 */
const handleHit = function (target, username) {
	debug(`${username} choose ${target} and it was a hit`)
}

/**
 * Handle miss
 * 
 */
const handleMiss = function (target, username) {
	debug(`${username} choose ${target} and it was a miss`)
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

	socket.on('player:hit', handleHit)

	socket.on('player:miss', handleMiss)
}