import Gameboard from "./Gameboard.js"

describe("Gameboard class", () => {
	const nCols = 5
	const nRows = 10
	const gameboard = new Gameboard(nCols, nRows)

	it("is defined", () => {
		expect(Gameboard).toBeDefined()
	})

	it("has a size", () => {
		expect(gameboard.size).toEqual([nCols, nRows])
		expect(gameboard.nCols).toBe(nCols)
		expect(gameboard.nRows).toBe(nRows)
	})
})
