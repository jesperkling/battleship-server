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

	if (players.length === 0) {

		const playerOne = {
			id: this.id,
			room: 'game',
			username: username,
			turn: true,
		}
		this.join(playerOne.room)

		players.push(player)

		io.to(playerOne.room).emit('player:profile', players)
	} else if (players.length <= 1) {
		
		const playerTwo = {
			id: this.id,
			room: 'game',
			username: username,
			turn: false,
		}

		this.join(playerTwo.room)

		players.push(playerTwo)
		
		io.to(playerTwo.room).emit('player:profile', players)
		
	} else {
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

	const removePlayer = (id) => {
		const removeIndex = players.findIndex((player) => player.id === id)

		if (removeIndex !== -1) return players.splice(removeIndex, 1)[0]
	}

	const player = removePlayer(this.id)
	if (player) io.to(player.room).emit('player:disconnected', true)
}

/**
 * Handle guess
 * 
 */
const handleGuess = function (target) {
	console.log(`Player shot at ${target}`)
	this.broadcast.emit('player:guessed', target)
}

/**
 * Handle response to guess
 * 
 */
const handleGuessResponse = function (id, boolean) {
	console.log('shot reply', id)
	this.broadcast.emit('player:guess-response', id, boolean)
}

/**
 * Handle if boat sink
 *  
 */
const handleSunkenBoat = function (id) {
	this.broadcast.emit('player:boat-sunken', id)
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

	socket.on('player:guessed', handleGuess)

	socket.on('player:guess-response', handleGuessResponse)

	socket.on('player:boat-sunken', handleSunkenBoat)
}