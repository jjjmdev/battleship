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

	it("is composed by cells that can be retrieved", () => {
		const sampleCoordsArr = [
			[0, 0],
			[3, 6],
			[nCols - 1, nRows - 1],
		]

		sampleCoordsArr.forEach((sampleCoords) =>
			expect(gameboard.getCell(sampleCoords).coords).toEqual(sampleCoords)
		)
	})
})
