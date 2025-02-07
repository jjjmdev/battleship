import AiPlayer from "./AiPlayer"
import Gameboard from "./Gameboard"

describe("AiPlayer class", () => {
	it("is defined", () => {
		expect(AiPlayer).toBeDefined()
	})

	const playerName = "Captain AI"
	const opponentName = "Captain Opponent"
	const sizeGameboard = 10
	const fleet = [
		["Carrier", 5],
		["Battleship", 4],
		["Cruiser", 3],
		["Submarine", 3],
		["Destroyer", 2],
	]
	const fleetNames = fleet.map((item) => item[0])

	const aiPlayer = new AiPlayer(playerName, fleet, sizeGameboard)
	const opponentPlayer = new AiPlayer(opponentName, fleet, sizeGameboard)

	describe("has the characteristics of a normal player", () => {
		// same tests as Player class
		it("has a name", () => {
			expect(aiPlayer.name).toBe(playerName)
		})

		it("has a gameboard", () => {
			expect(aiPlayer.gameboard).toEqual(new Gameboard(sizeGameboard))
		})

		it("has a fleet", () => {
			expect(aiPlayer.gameboard.fleet).toEqual(fleetNames)
			expect(aiPlayer.gameboard.notDeployedFleet).toEqual(fleetNames)
		})

		it("can randomly place the (not deployed) fleet on the board", () => {
			aiPlayer.randomShipsPlacement()
			expect(aiPlayer.gameboard.fleet).toEqual(fleetNames)
			expect(aiPlayer.gameboard.deployedFleet).toEqual(fleetNames)
		})

		it("can choose a valid opponent target cell for the next attack", () => {
			opponentPlayer.randomShipsPlacement()
			const cellCoords = aiPlayer.getOpponentTargetCellCoords()
			expect(opponentPlayer.gameboard.isValidCell(cellCoords)).toBeTruthy()
		})
	})
})
