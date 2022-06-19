/**
 * Socket Controller
 */

const debug = require('debug')('battleships:socket_controller');
let io = null; // socket.io server instance

let players = []
const playerOneBoats = ['81', '82', '83', '84']
const playerTwoBoats = ['1', '2', '3', '4']

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
			currentPlayer: null,
		}
		this.join(playerOne.room)
		players.push(player)

		io.to(playerOne.room).emit('player:profile', players)
	} else if (players.length <= 1) {
		
		const playerTwo = {
			id: this.id,
			room: 'game',
			username: username,
			currentPlayer: null,
		}
		this.join(playerTwo.room)
		players.push(playerTwo)
		
		const startingPlayer = players[Math.floor(Math.random() * players.length)]
		startingPlayer.currentPlayer = 'user'

		const secondPlayer = players.find((player) => player.currentPlayer !== 'user')
		secondPlayer.currentPlayer = 'opponent'

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

	if (this.id) {
		this.broadcast.emit('player:disconnected', true)
	}

	delete this.id
	players = []

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
	console.log(`Shot response at ${id} and it's ${boolean}`)
	this.broadcast.emit('player:guess-response', id, boolean)
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
}