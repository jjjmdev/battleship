import Player from "./Player.js"
import Gameboard from "./Gameboard.js"

describe("Player class", () => {
	it("is defined", () => {
		expect(Player).toBeDefined()
	})

	const playerName = "Captain X"
	const sizeGameBoard = 10
	const fleet = [
		["Carrier", 5],
		["Battleship", 4],
		["Cruiser", 3],
		["Submarine", 3],
		["Destroyer", 2],
	]
	const fleetNames = fleet.map((item) => item[0])
	const player = new Player(playerName, fleet, sizeGameBoard)

	it("has a name", () => {
		expect(player.name).toBe(playerName)
	})

	it("has a gameboard", () => {
		expect(player.gameboard).toEqual(new Gameboard(sizeGameBoard))
	})

	it("has a fleet", () => {
		expect(player.gameboard.fleet).toEqual(fleetNames)
		expect(player.gameboard.notDeployedFleet).toEqual(fleetNames)
	})
})
