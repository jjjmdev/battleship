import AiPlayer from "./AiPlayer"
import Gameboard from "./Gameboard"
import * as math from "../utils/math.js"

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
	})

	it("can choose a valid opponent target cell for the next attack", () => {
		opponentPlayer.randomShipsPlacement()
		const cellCoords = aiPlayer.getOpponentTargetCellCoords()
		expect(opponentPlayer.gameboard.isValidCell(cellCoords)).toBeTruthy()
	})

	it("doesn't propose the same random target cell twice after this has been attacked", () => {
		for (let i = 0; i < sizeGameboard * sizeGameboard; i++) {
			const cellCoords = aiPlayer.getOpponentTargetCellCoords()
			expect(() => {
				const isHit = opponentPlayer.gameboard.receiveAttack(cellCoords) > 0
				aiPlayer.applyPostAttackActions(cellCoords, { isHit })
			}).not.toThrow()
		}
	})

	it("throws an error if there are no possible opponent targets", () => {
		expect(() => aiPlayer.getOpponentTargetCellCoords()).toThrow(
			"There are no possible opponent targets"
		)
	})

	describe("it can apply different strategies", () => {
		it("can apply the random strategy", () => {
			// mock the randomInt function from math module
			const randomInt = jest.spyOn(math, "randomInt")

			const aiPlayer = new AiPlayer(
				playerName,
				fleet,
				sizeGameboard,
				sizeGameboard,
				"random"
			)
			const opponentPlayer = new AiPlayer(opponentName, fleet, sizeGameboard)
			opponentPlayer.gameboard.placeShip("Destroyer", [0, 0], "E")

			randomInt.mockImplementation(() => 0) // Mock the return value to 0
			const cellCoords = aiPlayer.getOpponentTargetCellCoords()
			const isHit = opponentPlayer.gameboard.receiveAttack(cellCoords) > 0
			aiPlayer.applyPostAttackActions(cellCoords, { isHit })

			// After the previous attack, [0, 0] is removed from the possible targets array
			expect(cellCoords).toEqual([0, 0])
			expect(isHit).toBe(true)

			randomInt.mockImplementation(() => 5)
			const cellCoords2 = aiPlayer.getOpponentTargetCellCoords()
			const isHit2 = opponentPlayer.gameboard.receiveAttack(cellCoords2) > 0
			aiPlayer.applyPostAttackActions(cellCoords2, { isHit: isHit2 })

			expect(cellCoords2).toEqual([0, 6])
			expect(isHit2).toBe(false)
		})

		it("can apply the HuntTarget strategy", () => {
			const randomInt = jest.spyOn(math, "randomInt")

			const aiPlayer = new AiPlayer(
				playerName,
				fleet,
				sizeGameboard,
				sizeGameboard,
				"huntTarget"
			)
			const opponentPlayer = new AiPlayer(opponentName, fleet, sizeGameboard)
			opponentPlayer.gameboard.placeShip("Destroyer", [0, 0], "E")

			// Score a miss
			randomInt.mockImplementation(() => 5)
			const cellCoords = aiPlayer.getOpponentTargetCellCoords()
			const isHit = opponentPlayer.gameboard.receiveAttack(cellCoords) > 0
			aiPlayer.applyPostAttackActions(cellCoords, { isHit })

			expect(cellCoords).toEqual([0, 5])
			expect(isHit).toBe(false)

			// Now, score a hit
			randomInt.mockImplementation(() => 0)
			const cellCoords2 = aiPlayer.getOpponentTargetCellCoords()
			const isHit2 = opponentPlayer.gameboard.receiveAttack(cellCoords2) > 0
			aiPlayer.applyPostAttackActions(cellCoords2, { isHit: isHit2 })

			expect(cellCoords2).toEqual([0, 0])
			expect(isHit2).toBe(true)

			// For the random strategy, this should give [0, 2],
			// but using the huntTarget strategy it gives [1, 0] (high priority)
			randomInt.mockImplementation(() => 1)
			const cellCoords3 = aiPlayer.getOpponentTargetCellCoords()
			const isHit3 = opponentPlayer.gameboard.receiveAttack(cellCoords3) > 0
			aiPlayer.applyPostAttackActions(cellCoords3, { isHit: isHit3 })

			expect(cellCoords3).toEqual([1, 0])
			expect(isHit3).toBe(true)
		})

		it("can apply the improvedHuntTarget strategy", () => {
			// mock the randomInt function from math module
			const randomInt = jest.spyOn(math, "randomInt")

			const aiPlayer = new AiPlayer(
				playerName,
				fleet,
				sizeGameboard,
				sizeGameboard,
				"improvedHuntTarget"
			)
			const opponentPlayer = new AiPlayer(opponentName, fleet, sizeGameboard)
			opponentPlayer.gameboard.placeShip("Destroyer", [0, 0], "E")

			// Score a miss: the [0, 1] cell is skipped in hunt mode
			randomInt.mockImplementation(() => 2)
			const cellCoords = aiPlayer.getOpponentTargetCellCoords()
			const isHit = opponentPlayer.gameboard.receiveAttack(cellCoords) > 0
			aiPlayer.applyPostAttackActions(cellCoords, { isHit })

			expect(cellCoords).toEqual([0, 2])
			expect(isHit).toBe(false)

			// Now, score a hit
			randomInt.mockImplementation(() => 0)
			const cellCoords2 = aiPlayer.getOpponentTargetCellCoords()
			const isHit2 = opponentPlayer.gameboard.receiveAttack(cellCoords2) > 0
			aiPlayer.applyPostAttackActions(cellCoords2, { isHit: isHit2 })

			expect(cellCoords2).toEqual([0, 0])
			expect(isHit2).toBe(true)

			// Using the improvedHuntTarget strategy, it gives [1, 0]
			// high priority
			randomInt.mockImplementation(() => 1)
			const cellCoords3 = aiPlayer.getOpponentTargetCellCoords()
			const isHit3 = opponentPlayer.gameboard.receiveAttack(cellCoords3) > 0
			aiPlayer.applyPostAttackActions(cellCoords3, { isHit: isHit3 })

			expect(cellCoords3).toEqual([1, 0])
			expect(isHit3).toBe(true)
		})
	})
})
