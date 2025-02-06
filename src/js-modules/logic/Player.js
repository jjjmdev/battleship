import Gameboard from "./Gameboard"

export default class Player {
	#name
	#gameboard

	constructor(name, nCols = 10, nRows = nCols) {
		this.#name = name
		this.#gameboard = new Gameboard(nCols, nRows)
	}

	get name() {
		return this.#name
	}

	get gameboard() {
		return this.#gameboard
	}
}
