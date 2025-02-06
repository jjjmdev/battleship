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
	#deployedFleet
	#notDeployedFleet
	#sunkFleet

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

		this.#deployedFleet = new Map()
		this.#notDeployedFleet = new Map()
		this.#sunkFleet = new Map()
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

	get deployedFleet() {
		return [...this.#deployedFleet.keys()]
	}

	get notDeployedFleet() {
		return [...this.#notDeployedFleet.keys()]
	}

	get sunkFleet() {
		return [...this.#sunkFleet.keys()]
	}

	get fleet() {
		// Returns keys (names)
		return [...this.deployedFleet, ...this.notDeployedFleet, ...this.sunkFleet]
	}

	get sunkFleet() {
		return [...this.#sunkFleet.keys()]
	}

	hasDeployedShip(name) {
		return this.#deployedFleet.has(name)
	}

	hasNotDeployedShip(name) {
		return this.#notDeployedFleet.has(name)
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
		this.#notDeployedFleet.set(name, ship)
	}

	hasShip(name) {
		return (
			this.hasDeployedShip(name) ||
			this.hasNotDeployedShip(name) ||
			this.hasSunkShip(name)
		)
	}

	canPlaceShip(name, [cStart, rStart], direction) {
		if (!this.hasNotDeployedShip(name)) {
			return false
		}

		const ship = this.#notDeployedFleet.get(name)

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
		if (!this.canPlaceShip(name, [cStart, rStart], direction))
			throw new Error("The ship cannot be placed in this position")

		const ship = this.#notDeployedFleet.get(name)
		const [cDisp, rDisp] = directionDisplacement[direction]

		let [cCurrent, rCurrent] = [cStart, rStart]
		let counter = 0
		while (counter < ship.length) {
			this.#cells[cCurrent][rCurrent].placeShip(ship)

			cCurrent += cDisp
			rCurrent += rDisp

			counter += 1
		}

		this.#notDeployedFleet.delete(name)
		this.#deployedFleet.set(name, ship)
	}

	receiveAttack([c, r]) {
		const cell = this.getCell([c, r])
		const isHit = cell.receiveAttack()
		const ship = cell.getShip()
		if (isHit && ship !== null && ship.isSunk()) {
			// get the name of the ship
			const name = getMapKey(this.#deployedFleet, ship)
			this.#sunkFleet.set(name, ship)
			this.#deployedFleet.delete(name)
		}

		return isHit
	}

	hasSunkShip(name) {
		return this.#sunkFleet.has(name)
	}

	hasDeployedShips() {
		return this.#deployedFleet.size > 0
	}
}

function getMapKey(map, val) {
	for (let [key, value] of map.entries()) {
		if (value === val) return key
	}

	return null
}
