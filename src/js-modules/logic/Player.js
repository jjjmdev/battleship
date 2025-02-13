import Gameboard from "./Gameboard"
import { randomInt } from "../utils/math"

const allDirections = Gameboard.getAllDirections()

export default class Player {
	#name
	#gameboard
	#fleet

	static defaultGameboardSize = 10
	static defaultFleet = [
		["ship_5", 5],
		["ship_4", 4],
		["ship_3b", 3],
		["ship_3a", 3],
		["ship_2a", 2],
	]

	constructor(
		name,
		fleet = Player.defaultFleet,
		nCols = Player.defaultGameboardSize,
		nRows = nCols
	) {
		this.#name = name
		this.#gameboard = new Gameboard(nCols, nRows)
		this.#fleet = fleet
		this.#fleet.forEach(([name, length]) =>
			this.#gameboard.addShip(name, length)
		)
	}

	get name() {
		return this.#name
	}

	get gameboard() {
		return this.#gameboard
	}

	get fleet() {
		return this.#fleet.keys()
	}

	randomShipsPlacement() {
		this.#gameboard.notDeployedFleet.forEach((name) => {
			let cStart, rStart, direction
			do {
				cStart = randomInt(0, this.#gameboard.nCols - 1)
				rStart = randomInt(0, this.#gameboard.nRows - 1)
				direction = allDirections[randomInt(0, allDirections.length - 1)]
			} while (!this.#gameboard.canPlaceShip(name, [cStart, rStart], direction))

			this.#gameboard.placeShip(name, [cStart, rStart], direction)
		})
	}
}
