/**
 * Socket Controller
 */

const debug = require('debug')('battleships:socket_controller');
let io = null; // socket.io server instance

let players = []
let games = []

/**
 * Handle a user connecting
 * 
 */
const handleConnect = function(username) {
	debug(`${username} connected with id ${this.id} wants to join game`)

	const player = {
		id: this.id,
		username: username,
		turn: players[0] ? false : true,
	}

	players.push(player)

	if (players.length > 1) {
		let game = {
			id: 'game-' + players[0].id,
			players,
		}
		
		games.push(game)

		this.join(game.id)

		io.to(game.id).emit('player:profile', game.players)
		
		players = []
	} else {
		this.join('game-' + this.id)
	}
	console.log('games when connect:', games)
}

/**
 * Handle a user disconnecting
 *
 */
const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);

	const game = games.find((game) => {
		const playerActive = game.players.some((player) => player.id === this.id)
		
		if (playerActive) return game
	})

	const removePlayer = (id) => {
		const removeIndex = game.players.findIndex((player) => player.id === id)

		if (removeIndex !== -1) return game.players.splice(removeIndex, 1)[0]
	}

	const removeGame = (id) => {
		const removeActiveGame = games.findIndex((emptyGame) => emptyGame.id === id)

		if (removeActiveGame !== -1) return games.splice(removeActiveGame, 1)[0]
	}

	if (game) {
		removePlayer(this.id)

		if (game.players.length === 0) {
			removeGame(game.id)
		}

		io.to(game.id).emit('player:disconnected', true)
	} 
}

/**
 * Handle guess
 * 
 */
const handleGuess = function (target) {
	const game = games.find((game) => {
		const playerActive = game.players.some((player) => player.id === this.id)

		if (playerActive) return game
	})

	if (game) {
		this.broadcast.to(game.id).emit('player:guessed', target)
	}
}

/**
 * Handle response to guess
 * 
 */
const handleGuessResponse = function (id, boolean) {
	const game = games.find((game) => {
		const playerActive = game.players.some((player) => player.id === this.id)

		if (playerActive) return game
	})

	if (game) {
		this.broadcast.to(game.id).emit('player:guess-response', id, boolean)
	}
}

/**
 * Handle response to guess
 * 
 */
const handleBoatSunken = function (id) {
	const game = games.find((game) => {
		const playerActive = game.players.some((player) => player.id === this.id)

		if (playerActive) return game
	})
	
	this.broadcast.to(game.id).emit('player:boat-sunken', id)
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

	socket.on('player:boat-sunken', handleBoatSunken)
}