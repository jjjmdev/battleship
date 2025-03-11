import Player from "./Player.js"
import { randomInt } from "../utils/math.js"

const defaultSkills = "random"

export default class AiPlayer extends Player {
	#possibleTargets
	#skills
	#getOpponentTargetCellCoords // methods initialized based on the #skills
	#applyPostAttackActions // methods initialized based on the #skills

	constructor(
		name,
		fleet = Player.defaultFleet,
		nCols = Player.defaultGameboardSize,
		nRows = nCols,
		skills = defaultSkills
	) {
		super(name, fleet, nCols, nRows)

		this.#initPossibleTargets()
		this.#skills = skills
		this.#initPlayerSkills()
	}

	#initPossibleTargets() {
		this.#possibleTargets = new Set(
			this.gameboard.cells.flat().map((cell) => cell.coords)
		)
	}

	#initPlayerSkills() {
		if (this.#skills == "random") {
			this.#getOpponentTargetCellCoords =
				this.#getOpponentTargetCellCoordsRandom
			this.#applyPostAttackActions = this.#applyPostAttackActionsRandom
		}
	}

	getOpponentTargetCellCoords() {
		// this is a wrapper and allows to use different strategies in the future
		// implementations using the same interface: todo
		return this.#getOpponentTargetCellCoords()
	}

	applyPostAttackActions(cellCoords, otherData = {}) {
		// this is a wrapper and allows to use different strategies in the future
		// implementations using the same interface: todo
		// otherData is set as argument for future improvements
		return this.#applyPostAttackActions(cellCoords, otherData)
	}

	/* random strategy */
	#getOpponentTargetCellCoordsRandom() {
		if (this.#possibleTargets.size === 0) {
			throw new Error("There are no possible opponent targets")
		}

		return Array.from(this.#possibleTargets)[
			randomInt(0, this.#possibleTargets.size - 1)
		]
	}

	#applyPostAttackActionsRandom(cellCoords) {
		this.#possibleTargets.delete(cellCoords)
	}
}
