import Player from "./Player.js"
import { randomInt } from "../utils/math.js"

const defaultSkills = "random"
const arr2str = (arr) => arr.join(",")

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
		this.#possibleTargets = new Map(
			this.gameboard.cells
				.flat()
				.map((cell) => [arr2str(cell.coords), cell.coords])
		)
		// [[3, 2], [2, 1]]
		// [["3,2", [3, 2]], [["2,1"], [2, 1]]]
		// this.#possibleTargets.set("3,2", [3, 2])
		// this.#possibleTargets.set("2,1", [2, 1])
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

	applyPostAttackActions(cellCoords, outcome = {}) {
		// this is a wrapper and allows to use different strategies in the future
		// implementations using the same interface: todo
		// outcome is set as argument for future improvements
		return this.#applyPostAttackActions(cellCoords, outcome)
	}

	/* random strategy */
	#getOpponentTargetCellCoordsRandom() {
		if (this.#possibleTargets.size === 0) {
			throw new Error("There are no possible opponent targets")
		}

		const idx = randomInt(0, this.#possibleTargets.size - 1)
		return Array.from(this.#possibleTargets.values())[idx]
	}

	#applyPostAttackActionsRandom(cellCoords) {
		this.#possibleTargets.delete(arr2str(cellCoords))
	}
}
