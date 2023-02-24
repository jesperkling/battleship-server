/**
 * Socket Controller
 */

const debug = require('debug')('battleship-server:socket_controller');
let io = null; // socket.io server instance
let rooms = {}
let nextUserId = 0
let nextRoomId = 0
let currentRoomId = 0
let emptyRoomExists = false

const getRoomKey = (socket) => {
	const roomOfUser = Object.values(rooms).find(room => {
		return room.users.hasOwnProperty(socket.id)
	})

	if (roomOfUser) {
		return Object.keys(rooms).find(key => rooms[key] === roomOfUser)
	}

	return null
}

const handleGameSearch = function () {

	emptyRoomExists = Object.values(rooms).find(room => Object.keys(room.users).length < 2)

	if (Object.keys(rooms).length === 0 || !emptyRoomExists) {
		this.join(`game${nextRoomId}`)
		rooms[nextRoomId] = {
			id: `game${nextRoomId}`,
			users: {},
		}
		currentRoomId = nextRoomId
		nextRoomId++
	} else {
		this.join(`game${currentRoomId}`)
		io.in(`game${currentRoomId}`).emit("gameFound")
	}

	debug("Specific room", JSON.stringify(rooms[currentRoomId].users))
	rooms[currentRoomId].users[this.id] = `user${nextUserId}`
	nextUserId++
	debug(rooms)

	io.in(`game${currentRoomId}`).emit("HiRoom")

	debug("Number of players in room", io.sockets.adapter.rooms.get(`game${currentRoomId}`).size)

	const id = Object.keys(rooms[currentRoomId].users)

	function getRandomInteger(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	let turn = getRandomInteger(0, 1)
	console.log(id[turn], turn)
	io.in(`game${currentRoomId}`).emit("playerTurn", id[turn]);

}


/**
 * Export controller and attach handlers to events
 *
 */
module.exports = function(socket, _io) {
	// save a reference to the socket.io server instance
	io = _io;

	io.on("connection", async () => {
		debug(`Client ${socket.id} connected`)
		// debug(`All clients: `, await io.allSockets())
	})

	socket.on("disconnecting", () => {
		const idOfRoom = getRoomKey(socket)
		debug("ID of room:", idOfRoom)

		if (idOfRoom) {
			io.in(rooms[idOfRoom].id).emit("userLeft", "Opponent left room");
		}

		debug("Room to disconnect:", rooms[idOfRoom]?.id)

		if (idOfRoom) {
			io.socketsLeave(rooms[idOfRoom].id)
		}
		debug("Rooms AFTER leaving", io.sockets.adapter.rooms)
	})

	socket.on("disconnect", () => {
		debug(`Client ${socket.id} disconnected`)
		
		const idOfRoom = getRoomKey(socket)

		if (idOfRoom) {
			delete rooms[idOfRoom]
		}

		debug("Rooms after deletion", rooms)
	})

	socket.on("joinGame", handleGameSearch)

	socket.on("coordinates", (coordinates) => {
		const idOfRoom = getRoomKey(socket)

		if (idOfRoom) {
			socket.to(rooms[idOfRoom].id).emit("coordinatesFromServer", coordinates)
		}
	})

	socket.on("resultOfHit", (result) => {
		const idOfRoom = getRoomKey(socket);

		if (idOfRoom) {
			socket.to(rooms[idOfRoom].id).emit("resultOfHit", result)
			socket.to(rooms[idOfRoom].id).emit("shipsLeft", result)
		}
	})

	socket.on("madeMyMove", (message) => {
		const idOfRoom = getRoomKey(socket)
		if (idOfRoom) {
			socket.to(rooms[idOfRoom]).emit("changeTurn", message)
		}
	})
	
	socket.on("gameOver", () => {
		debug("Game over")
		const idOfRoom = getRoomKey(socket)
	
		if (idOfRoom) {
			socket.to(rooms[idOfRoom].id).emit("win")
			io.in(rooms[idOfRoom].id).emit("matchIsOver")
			io.socketsLeave(rooms[idOfRoom].id)
			delete rooms[idOfRoom]
		}
	})
}
