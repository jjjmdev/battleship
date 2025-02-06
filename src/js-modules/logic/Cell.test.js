import Cell from "./Cell.js"
import Ship from "./Ship.js"

describe("Cell class", () => {
	const coords = [4, 6]
	const cell = new Cell(coords)
	const ship = new Ship(4)

	it("is defined", () => {
		expect(Cell).toBeDefined()
	})

	it("has some coordinates", () => {
		expect(cell.coords).toEqual(coords)
		expect(cell.x).toBe(coords[0])
		expect(cell.y).toBe(coords[1])
	})

	it("can be occupied by a ship", () => {
		expect(cell.hasShip()).toBeFalsy()
		expect(cell.getShip()).toBeNull()
		cell.placeShip(ship)
		expect(cell.hasShip()).toBeTruthy()
		expect(cell.getShip()).toBe(ship)
	})

	it("can be attacked", () => {
		expect(cell.hasBeenAttacked()).toBeFalsy()
		cell.receiveAttack()
		expect(cell.hasBeenAttacked()).toBeTruthy()
	})

	const cellMiss = new Cell(coords)
	const cellHit = new Cell(coords)
	const shipHit = new Ship(4)
	cellHit.placeShip(shipHit)

	it("returns true if the attack is a hit", () => {
		expect(cellMiss.receiveAttack()).toBeFalsy()
		expect(cellHit.receiveAttack()).toBeTruthy()
	})

	it("increases the hits of the ship in it when it receives a hit attack", () => {
		expect(cellHit.getShip().hits).toBe(1)
	})
})
