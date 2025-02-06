import Gameboard from "./Gameboard"

export default class Player {
	#name
	#gameboard
	#fleet

	constructor(name, fleet, nCols = 10, nRows = nCols) {
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
}
