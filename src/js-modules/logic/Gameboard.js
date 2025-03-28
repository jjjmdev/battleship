import Cell from "./Cell.js"
import Ship from "./Ship.js"
import { randomInt } from "../utils/math.js"

const directionDisplacement = {
	N: [0, -1],
	E: [1, 0],
	S: [0, 1],
	W: [-1, 0],
}
const directionNext = {
	N: "E",
	E: "S",
	S: "W",
	W: "N",
}

export default class Gameboard {
	#nCols
	#nRows
	#cells
	#deployedFleet
	#notDeployedFleet
	#sunkFleet
	#fleetPosition
	#shipOnMoveData

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
		this.#fleetPosition = new Map()
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

	get cells() {
		return this.#cells
	}

	get deployedFleetAsShipObj() {
		return [...this.#deployedFleet.values()]
	}

	get notDeployedFleetAsShipObj() {
		return [...this.#notDeployedFleet.values()]
	}

	get sunkFleetAsShipObj() {
		return [...this.#sunkFleet.values()]
	}

	get fleetAsShipObj() {
		return [
			...this.deployedFleetAsShipObj,
			...this.notDeployedFleetAsShipObj,
			...this.sunkFleetAsShipObj,
		]
	}

	static getAllDirections() {
		return Object.keys(directionDisplacement)
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

		const ship = new Ship(length, name)
		this.#notDeployedFleet.set(name, ship)
		this.#fleetPosition.set(name, null)
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
		const cellsCoords = []
		while (counter < ship.length) {
			this.#cells[cCurrent][rCurrent].placeShip(ship)
			cellsCoords.push([cCurrent, rCurrent])
			cCurrent += cDisp
			rCurrent += rDisp

			counter += 1
		}

		this.#notDeployedFleet.delete(name)
		this.#deployedFleet.set(name, ship)
		this.#fleetPosition.set(name, [cellsCoords, direction])
	}

	resetShip(name) {
		// you can reset a ship only if it is deployed
		if (!this.hasDeployedShip(name)) {
			throw new Error("The ship is not deployed.")
		}

		const ship = this.#deployedFleet.get(name)

		// reset the cells
		const cellCoords = this.#fleetPosition.get(name)[0]
		cellCoords.forEach(([c, r]) => this.#cells[c][r].removeShip())

		this.#deployedFleet.delete(name)
		this.#notDeployedFleet.set(name, ship)
		this.#fleetPosition.set(name, null)
	}

	#offsetRelativeToStern(relativeToCoord, cellCoords) {
		const [centerCol, centerRow] = relativeToCoord
		return cellCoords.findIndex(([c, r]) => c === centerCol && r === centerRow)
	}

	#sternFromOffset(relativeToCoord, offset, direction) {
		const [col, row] = relativeToCoord
		const [cDisp, rDisp] = directionDisplacement[direction]
		return [col - offset * cDisp, row - offset * rDisp]
	}

	rotateShip(name, optionalCenterOfRotation = null) {
		if (!this.hasDeployedShip(name)) {
			throw new Error("The ship is not deployed.")
		}

		// get the old position
		const [cellCoords, direction] = this.#fleetPosition.get(name)

		// compute the center of rotation coordinates
		const centerOfRotation =
			optionalCenterOfRotation == null
				? cellCoords[0]
				: optionalCenterOfRotation
		const [centerCol, centerRow] = centerOfRotation
		// compute the offset of the center of rotation from the stern
		const offset = this.#offsetRelativeToStern(centerOfRotation, cellCoords)

		// reset the ship (remove it from the gameboard)
		this.resetShip(name)

		// find a direction where you could place the rotated ship
		// note that this loop is finite, since at most you return to the original direction
		let newDirection = direction
		let newSternCoords
		do {
			newDirection = directionNext[newDirection]
			newSternCoords = this.#sternFromOffset(
				centerOfRotation,
				offset,
				newDirection
			)
		} while (!this.canPlaceShip(name, newSternCoords, newDirection))

		// place the rotated ship
		this.placeShip(name, newSternCoords, newDirection)
	}

	startMoveShip(name, optionalRelativeToCoords = null) {
		if (!this.hasDeployedShip(name)) {
			throw new Error("This ship is not deployed.")
		}

		// get the current ship position and direction
		const [cellCoords, direction] = this.#fleetPosition.get(name)
		const sternCoords = cellCoords[0]

		// get the "relative to" coordinates: if the optionalRelativeToCoords is omitted
		// this defaults to sternCoords
		const relativeToCoords = optionalRelativeToCoords
			? optionalRelativeToCoords
			: sternCoords

		// compute the offset of the "relative to" coordinates from the stern
		const offset = this.#offsetRelativeToStern(relativeToCoords, cellCoords)

		// save the current ship stern position, direction, and offset
		this.#shipOnMoveData = { sternCoords, direction, offset }

		// reset the ship (remove it from the gameboard)
		this.resetShip(name)
	}

	canPlaceShipOnMove(name, testRelativeCoords) {
		// test if the ship being moved could be placed in a given position, returning true or false
		// the ship is not actually placed

		if (!this.#shipOnMoveData) {
			throw new Error("No ship is being moved")
		}

		// get the saved ship stern direction and offset from #shipOnMoveData
		const { direction, offset } = this.#shipOnMoveData

		// get the new stern coords
		const testSternCoords = this.#sternFromOffset(
			testRelativeCoords,
			offset,
			direction
		)

		return this.canPlaceShip(name, testSternCoords, direction)
	}

	endMoveShip(name, newRelativeCoords = null) {
		// NOTE: this assumes no other ship is deployed/edited in the original ship position between startMoveShip() and this method call

		// get the saved ship position, direction, and offset from #shipOnMoveData and then reset it
		const { sternCoords, direction, offset } = this.#shipOnMoveData
		this.#shipOnMoveData = null

		// get the new stern coords
		// use the saved sternCoords if newRelativeCoords is omitted
		// which defaults it to the old position
		const newSternCoords = newRelativeCoords
			? this.#sternFromOffset(newRelativeCoords, offset, direction)
			: sternCoords

		// if you can't place it in the new position, restore the old one
		const nextSternCoords = this.canPlaceShip(name, newSternCoords, direction)
			? newSternCoords
			: sternCoords
		// place the ship in the new position
		this.placeShip(name, nextSternCoords, direction)

		return nextSternCoords.some((itm, idx) => itm !== sternCoords[idx])
	}

	getShipPosition(shipName) {
		if (!this.hasShip(shipName)) {
			throw new Error("The ship is not in the fleet")
		}

		return this.#fleetPosition.get(shipName)
	}

	receiveAttack([c, r]) {
		// Returns the outcomeCode:
		// 0 (falsy): miss
		// 1 (truthy): hit
		// 2 (truthy): hit and sunk
		const cell = this.getCell([c, r])
		const isHit = cell.receiveAttack()
		const ship = cell.getShip()
		if (isHit) {
			if (ship.isSunk()) {
				// get the name of the ship
				const name = ship.name
				this.#sunkFleet.set(name, ship)
				this.#deployedFleet.delete(name)
				return 2
			}

			return 1
		}

		return 0
	}

	hasSunkShip(name) {
		return this.#sunkFleet.has(name)
	}

	hasDeployedShips() {
		return this.#deployedFleet.size > 0
	}

	hasNotDeployedShips() {
		return this.#notDeployedFleet.size > 0
	}
}
