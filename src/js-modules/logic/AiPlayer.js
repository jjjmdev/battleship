import Player from "./Player.js"
import { randomInt } from "../utils/math.js"

// The Ai can have different skills, which define different applied strategies.
// - random: choose just a random cell on the board. A target list is kept,
// and after each attack, the attacked cell is removed from the list.
//
// - huntTarget: choose a random target as a base. However, when you score a hit,
// add the neighbouring cells which have not been attacked yet to some high
// priority list. When the priority list is not empty, choose the next cell
// to attack among these instead of the global one.
//
// improvedHuntTarget: the same as the huntTarget one.
// However, in hunt mode, not all cells are considered,
// but just the ones for which: (row + col) % opponentMinShipSize === 0,
// where opponentMinShipSize is the minimum  ship size of the opponent
// See https://towardsdatascience.com/coding-an-intelligent-battleship-agent-bf0064a4b319

const defaultSkills = "huntTarget"
const arr2str = (arr) => arr.join(",")
const neighboursCellDisplacement = [
	[0, 1],
	[0, -1],
	[1, 0],
	[-1, 0],
]

export default class AiPlayer extends Player {
	#possibleTargets
	#highPriorityPossibleTargets
	#skills
	#getOpponentTargetCellCoords // methods initialized based on the #skills
	#applyPostAttackActions // methods initialized based on the #skills
	#opponentMinShipSize
	#opponentShipSizes
	#selectedPossibleTargets

	constructor(
		name,
		fleet = Player.defaultFleet,
		nCols = Player.defaultGameboardSize,
		nRows = nCols,
		skills = defaultSkills
	) {
		super(name, fleet, nCols, nRows)

		this.#initPossibleTargets()

		if (skills == "improvedHuntTarget") {
			this.#initOpponentShipsSize()
		}
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
		this.#highPriorityPossibleTargets = new Map()
	}

	#initPlayerSkills() {
		if (this.#skills == "random") {
			this.#getOpponentTargetCellCoords =
				this.#getOpponentTargetCellCoordsRandom
			this.#applyPostAttackActions = this.#applyPostAttackActionsRandom
		} else if (this.#skills == "huntTarget") {
			this.#getOpponentTargetCellCoords =
				this.#getOpponentTargetCellCoordsHuntTarget
			this.#applyPostAttackActions = this.#applyPostAttackActionsHuntTarget
		} else if (this.#skills == "improvedHuntTarget") {
			this.#getOpponentTargetCellCoords =
				this.#getOpponentTargetCellCoordsImprovedHuntTarget
			this.#applyPostAttackActions =
				this.#applyPostAttackActionsImprovedHuntTarget
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
	#getOpponentTargetCellCoordsRandom(targetMap = this.#possibleTargets) {
		if (targetMap.size === 0) {
			throw new Error("There are no possible opponent targets")
		}

		const idx = randomInt(0, targetMap.size - 1)
		return Array.from(targetMap.values())[idx]
	}

	#applyPostAttackActionsRandom(cellCoords) {
		this.#possibleTargets.delete(arr2str(cellCoords))
	}

	/* huntTarget strategy */
	#getOpponentTargetCellCoordsHuntTarget() {
		const targetMap =
			this.#highPriorityPossibleTargets.size > 0
				? this.#highPriorityPossibleTargets // target mode
				: this.#possibleTargets // hunt mode
		return this.#getOpponentTargetCellCoordsRandom(targetMap)
	}

	#applyPostAttackActionsHuntTarget(cellCoords, outcome = {}) {
		this.#possibleTargets.delete(arr2str(cellCoords))
		this.#highPriorityPossibleTargets.delete(arr2str(cellCoords))

		if (outcome.isSunk) {
			this.#removeOpponentSunkShipSize(outcome.sunkShip.length)

			if (this.#highPriorityPossibleTargets.size > 0) {
				this.#highPriorityPossibleTargets.forEach((values, keys) => {
					this.#possibleTargets.set(keys, values)
					this.#highPriorityPossibleTargets.delete(keys)
				})
			}
		} else if (outcome.isHit) {
			// give high priority to the next turn
			const [col, row] = cellCoords

			neighboursCellDisplacement.forEach(([dCol, dRow]) => {
				// Compute the neighbor cells
				const neighCellCoords = [col + dCol, row + dRow]

				// If the cell is in the possible targets list (ie, not attacked yet)
				// and not yet in the high priority one, move it there
				// This also eliminates coords outside of parameter
				if (this.#possibleTargets.has(arr2str(neighCellCoords))) {
					this.#possibleTargets.delete(arr2str(neighCellCoords))
					this.#highPriorityPossibleTargets.set(
						arr2str(neighCellCoords),
						neighCellCoords
					)
				}
			})
			// TODO
			// If hit again and not sink yet, the next attack must be the same direction
		}
	}

	/* improvedHuntTarget strategy */
	#getOpponentTargetCellCoordsImprovedHuntTarget() {
		// If the high priority target list is not empty, select one of that
		if (this.#highPriorityPossibleTargets.size > 0) {
			// target mode
			const targetMap = this.#highPriorityPossibleTargets

			return this.#getOpponentTargetCellCoordsRandom(targetMap)
		} else {
			// hunt mode
			const targetMap = this.#possibleTargets
			while (true) {
				const [row, col] = this.#getOpponentTargetCellCoordsRandom(targetMap)

				if ((row + col) % this.#opponentMinShipSize === 0) {
					return [row, col]
				}
			}
		}
	}

	#applyPostAttackActionsImprovedHuntTarget(cellCoords, outcome) {
		this.#applyPostAttackActionsHuntTarget(cellCoords, outcome)
	}

	#initOpponentShipsSize() {
		// The opponent ships' length are the same of the current player
		// so use this players coordinates
		// Sort the array by ship length
		this.#opponentShipSizes = this.gameboard.fleetAsShipObj
			.map((ship) => ship.length)
			.sort((a, b) => a - b)
		this.#updateOpponentMinShipSize()
	}

	#removeOpponentSunkShipSize(size) {
		this.#opponentShipSizes.splice(this.#opponentShipSizes.indexOf(size), 1)
		this.#updateOpponentMinShipSize()
	}

	#updateOpponentMinShipSize() {
		// The minimum is the first element, as it is sorted
		this.#opponentMinShipSize = this.#opponentShipSizes[0]

		// Get the selected possible targets based on
		// this.#opponentMinShipSize
		this.#getSelectedPossibleTargets()
	}

	#getSelectedPossibleTargets() {
		const minShipSize = this.#opponentMinShipSize

		// initialize the possible targets Map with the full possibleTargets list
		// store it in an array, which will be used to keep track of different sets of the same Map size
		let selectedPossibleTargetsArr = [
			new Map(JSON.parse(JSON.stringify(Array.from(this.#possibleTargets)))),
		]
		let minMapSize = selectedPossibleTargetsArr[0].size

		console.log("full:", minMapSize)
		// There are different possible Maps that can be considered, each one with a different offset.
		// The elements in each one are those who fulfill: (row + col) % minShipSize === offset
		for (let offset = 0; offset < minShipSize; offset++) {
			// Create a temporary Map with the possible targets cells fulfilling parity with this offset
			const tempSelectedPossibleTargets = new Map()
			;[...this.#possibleTargets.entries()].forEach(([key, [row, col]]) => {
				if ((row + col) % minShipSize === offset) {
					tempSelectedPossibleTargets.set(key, [row, col])
				}
			})
			const tempMapSize = tempSelectedPossibleTargets.size

			console.log("offset", offset, tempMapSize, tempSelectedPossibleTargets)

			// If this temporary Map has a smaller size than minMapSize, replace the selectedPossibleTargetsArr and update (reduce) minMapSize
			if (tempMapSize < minMapSize) {
				selectedPossibleTargetsArr = [tempSelectedPossibleTargets]
				minMapSize = tempMapSize
				console.log("replaced", minMapSize)
			} else if (tempMapSize === minMapSize) {
				selectedPossibleTargetsArr.push(tempSelectedPossibleTargets)
				console.log("append", minMapSize)
			}

			// Use a set from selectedPossibleTargetsArr. Choose randomly, as they are equivalent
			const idx = randomInt(0, selectedPossibleTargetsArr.length - 1)
			console.log(idx, selectedPossibleTargetsArr)
			this.#selectedPossibleTargets = selectedPossibleTargetsArr[idx]
		}
	}
}
