import Player from "./Player.js"
import { randomInt } from "../utils/math.js"

export default class AiPlayer extends Player {
	#possibleTargets

	constructor(
		name,
		fleet = Player.defaultFleet,
		nCols = Player.defaultGameboardSize,
		nRows = nCols
	) {
		super(name, fleet, nCols, nRows)

		this.#initPossibleTargets()
	}

	#initPossibleTargets() {
		this.#possibleTargets = new Set(
			this.gameboard.cells.flat().map((cell) => cell.coords)
		)
	}

	getOpponentTargetCellCoords() {
		return this.#getOpponentTargetCellCoordsRandom()
	}

	#getOpponentTargetCellCoordsRandom() {
		return Array.from(this.#possibleTargets)[
			randomInt(0, this.#possibleTargets.size - 1)
		]
	}

	applyPostAttackActions(cellCoords, otherData = {}) {
		return this.#applyPostAttackActionsRandom(cellCoords)
	}

	#applyPostAttackActionsRandom(cellCoords) {
		this.#possibleTargets.delete(cellCoords)
	}
}
