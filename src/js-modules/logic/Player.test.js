import Player from "./Player.js"
import Gameboard from "./Gameboard.js"

describe("Player class", () => {
	it("is defined", () => {
		expect(Player).toBeDefined()
	})

	const playerName = "Captain X"
	const sizeGameBoard = 10
	const player = new Player(playerName, sizeGameBoard)

	it("has a name", () => {
		expect(player.name).toBe(playerName)
	})

	it("has a gameboard", () => {
		expect(player.gameboard).toEqual(new Gameboard(sizeGameBoard))
	})
})
