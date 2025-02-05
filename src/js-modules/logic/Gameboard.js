import Cell from "./Cell.js"
import Ship from "./Ship.js"

const directionDisplacement = {
	N: [0, -1],
	E: [1, 0],
	S: [0, 1],
	W: [-1, 0],
}

export default class Gameboard {
	#nCols
	#nRows
	#cells
	#fleet

	constructor(nCols, nRows = nCols) {
		this.#nCols = nCols
		this.#nRows = nRows

		this.#cells = []
		for (let c = 0; c < nCols; c++) {
			this.#cells.push([])
			for (let r = 0; r < nRows; r++) {
				const cell = new Cell([c, r])
				this.#cells[c].push(cell)
			}
		}

		this.#fleet = new Map()
	}

	get size() {
		return [this.#nCols, this.#nRows]
	}

	get nCols() {
		return this.#nCols
	}

	get nRows() {
		return this.#nRows
	}

	get fleet() {
		return [...this.#fleet.keys()]
	}

	getCell([c, r]) {
		if (this.isValidCell([c, r])) return this.#cells[c][r]

		throw new Error("The cell is out-of-bound")
	}

	isValidCell([c, r]) {
		return c >= 0 && c < this.#nCols && r >= 0 && r < this.#nRows
	}

	addShip(name, length) {
		if (this.hasShip(name)) {
			throw new Error("The ship is already in the fleet")
		}

		const ship = new Ship(length)
		this.#fleet.set(name, ship)
	}

	hasShip(name) {
		return this.#fleet.has(name)
	}

	canPlaceShip(name, [cStart, rStart], direction) {
		const ship = this.#fleet.get(name)

		// Compute the end
		const [cDisp, rDisp] = directionDisplacement[direction]

		// If the start or end is not in board, return false
		if (
			!this.isValidCell([cStart, rStart]) ||
			!this.isValidCell([
				cStart + cDisp * (ship.length - 1),
				rStart + rDisp * (ship.length - 1),
			])
		) {
			return false
		}

		// Traverse through the cells to check if there is a ship
		let [cCurrent, rCurrent] = [cStart, rStart]
		let counter = 0
		while (counter < ship.length) {
			if (this.#cells[cCurrent][rCurrent].hasShip()) return false

			cCurrent += cDisp
			rCurrent += rDisp
			counter += 1
		}

		return true
	}

	placeShip(name, [cStart, rStart], direction) {
		if (!this.canPlaceShip(name, [cStart, rStart], direction)) return false

		const ship = this.#fleet.get(name)
		const [cDisp, rDisp] = directionDisplacement[direction]

		let [cCurrent, rCurrent] = [cStart, rStart]
		let counter = 0
		while (counter < ship.length) {
			this.#cells[cCurrent][rCurrent].placeShip(ship)

			cCurrent += cDisp
			rCurrent += rDisp

			counter += 1
		}
	}
}
