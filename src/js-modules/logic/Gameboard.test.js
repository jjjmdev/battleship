import Gameboard from "./Gameboard.js"

describe("Gameboard class", () => {
	const nCols = 5
	const nRows = 10
	const gameboard = new Gameboard(nCols, nRows)

	const shipName1 = "My first ship"
	const shipLen1 = 4
	const shipName2 = "My second ship"
	const shipLen2 = 3

	const sampleShipCoordsArrIn = [
		[[1, 3], "N"],
		[[1, 3], "E"],
		[[1, 3], "S"],
	]

	const sampleShipCoordsArrOut = [
		[[1, 3], "W"],
		[[-1, 0], "E"],
		[[-1, 0], "W"],
	]

	const sampleCellCoordsArrIn = [
		[0, 0],
		[3, 6],
		[nCols - 1, nRows - 1],
	]
	const sampleCellCoordsArrOut = [
		[nCols, nRows],
		[nCols, 0],
		[0, nRows],
		[-1, -1],
	]

	it("is defined", () => {
		expect(Gameboard).toBeDefined()
	})

	it("has a size", () => {
		expect(gameboard.size).toEqual([nCols, nRows])
		expect(gameboard.nCols).toBe(nCols)
		expect(gameboard.nRows).toBe(nRows)
	})

	it("is composed by cells that can be retrieved", () => {
		sampleCellCoordsArrIn.forEach((sampleCoords) =>
			expect(gameboard.getCell(sampleCoords).coords).toEqual(sampleCoords)
		)
	})

	it("can say if a cell is valid or out-of-bound", () => {
		sampleCellCoordsArrIn.forEach((sampleCoords) =>
			expect(gameboard.isValidCell(sampleCoords)).toBeTruthy()
		)

		sampleCellCoordsArrOut.forEach((sampleCoords) =>
			expect(gameboard.isValidCell(sampleCoords)).toBeFalsy()
		)
	})

	it("throws an error if you try to retrieve an out-of-bound cell", () => {
		sampleCellCoordsArrOut.forEach((sampleCoords) =>
			expect(() => gameboard.getCell(sampleCoords)).toThrow(
				"The cell is out-of-bound"
			)
		)
	})

	it("has a fleet property that can be used to retrieve current ships", () => {
		expect(gameboard.fleet).toEqual([])
	})

	it("can add a ship to the fleet", () => {
		gameboard.addShip(shipName1, shipLen1)
		expect(gameboard.fleet).toEqual([shipName1])
	})

	it("throws an error if you try to add the same ship to the fleet", () => {
		expect(() => gameboard.addShip(shipName1, shipLen1)).toThrow(
			"The ship is already in the fleet"
		)
	})

	it("can check if a ship is already in the fleet", () => {
		expect(gameboard.hasShip(shipName1)).toBeTruthy()
		expect(gameboard.hasShip(shipName2)).toBeFalsy()
	})

	it("can check if a ship can be placed / is fully contained in the board", () => {
		sampleShipCoordsArrIn.forEach((sampleCoords) =>
			expect(gameboard.canPlaceShip(shipName1, ...sampleCoords)).toBeTruthy()
		)
	})

	it("can place a Ship in the board", () => {
		const sampleCoordsIn = sampleShipCoordsArrIn[0]
		const calculatedShipCells = [
			[1, 3],
			[1, 2],
			[1, 1],
			[1, 0],
		]

		gameboard.placeShip(shipName1, ...sampleCoordsIn)

		// Check ALL cells: Only the ones occupied by the ship should be occupied by a ship
		for (let c = 0; c < nCols; c++) {
			for (let r = 0; r < nRows; r++) {
				const cell = gameboard.getCell([c, r])
				if (
					calculatedShipCells.some(
						(coords) => coords[0] === c && coords[1] === r
					)
				) {
					expect(cell.hasShip()).toBeTruthy()
				} else {
					expect(cell.hasShip()).toBeFalsy()
				}
			}
		}
	})

	it("can check if a Ship can be placed / is not overlapped with other ships", () => {
		gameboard.addShip(shipName2, shipLen2)
		const sampleCoordsIn = sampleShipCoordsArrIn[1]
		expect(gameboard.canPlaceShip(shipName2, ...sampleCoordsIn)).toBeFalsy()
	})

	it("throws an error if you place a ship in an invalid position", () => {
		const sampleCoordsIn = sampleShipCoordsArrIn[1]
		expect(() => gameboard.placeShip(shipName2, ...sampleCoordsIn)).toThrow(
			"The ship cannot be placed in this position"
		)
	})
})
