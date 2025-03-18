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
// but just the ones for which: (row + col) % opponentMinShipSize === offset,
// where opponentMinShipSize is the minimum  ship size of the opponent,
// offset is a number between 0 and opponentMinShipSize-1, such that
// the set {(row, cols) such that (row + col) % opponentMinShipSize === offset}
// of target cells has the minimum size.
//
// - probabilistic: a frequency map is computed considering each possible
// target cell, counting all the ways an unsunk ship could be placed
// in there. Note that each possibility is weighted 1. However, if the ship
// in a given position crosses N hit cells, the weight is 100^N. This helps
// prioritizing the cells close to the hit ones.
//
// The cell with the highest frequency is selected. If there is more than one
// with the same maximum frequency, one of them is chosen randomly.
//
// When a cell is attacked, it is still removed from the possible targets list.
// However, its coordinates are saved in a hitTarget list if there is a hit.
// Once a ship is sunk, its occupied coordinates are removed from hitTargets list.
//
// - improvedProbabilistic: when in target mode (i.e., there are hit cells which
// are not of sunk ship), apply the probabilistic strategy.
//
// Otherwise, in hunt mode, consider just the selected cells considering parity
// (see improvedHuntTarget strategy), and in particular their squared frequencies,
// from which a probability is recomputed. Then, select a random cell among these cells,
// taking into account such probability. In this way, at the beginning it is more
// probable to choose a cell in the middle.
// However, there is no guarantee to be choosing exactly one of those.
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
	#hitTargets
	#targetFrequencies

	constructor(
		name,
		skills = defaultSkills,
		fleet = Player.defaultFleet,
		nCols = Player.defaultGameboardSize,
		nRows = nCols
	) {
		super(name, fleet, nCols, nRows)

		this.#initPossibleTargets()

		if (
			skills == "improvedHuntTarget" ||
			skills == "probabilistic" ||
			skills == "improvedProbabilistic"
		) {
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
		this.#hitTargets = new Map()
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
		} else if (this.#skills == "probabilistic") {
			this.#getOpponentTargetCellCoords =
				this.#getOpponentTargetCellCoordsProbabilistic
			this.#applyPostAttackActions = this.#applyPostAttackActionsProbabilistic
		} else if (this.#skills == "improvedProbabilistic") {
			this.#getOpponentTargetCellCoords =
				this.#getOpponentTargetCellCoordsImprovedProbabilistic
			this.#applyPostAttackActions =
				this.#applyPostAttackActionsImprovedProbabilistic
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

		if (outcome.isHit) {
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
		}
	}

	/* improvedHuntTarget strategy */
	#getOpponentTargetCellCoordsImprovedHuntTarget() {
		const targetMap =
			this.#highPriorityPossibleTargets.size > 0
				? this.#highPriorityPossibleTargets // target mode
				: this.#selectedPossibleTargets // hunt mode
		return this.#getOpponentTargetCellCoordsRandom(targetMap)
	}

	#applyPostAttackActionsImprovedHuntTarget(cellCoords, outcome) {
		this.#applyPostAttackActionsHuntTarget(cellCoords, outcome)

		// Delete the coords from the selectedPossibleTargets, too
		// There is no need to delete the neighboring cells if it is a hit,
		// Because in target mode, you won't be using #selectedPossibleTargets
		this.#selectedPossibleTargets.delete(arr2str(cellCoords))

		// If the ship is sunk, update the opponentMinShipSize
		if (outcome.isSunk) {
			this.#removeOpponentSunkShipSize(outcome.sunkShip.length)
		}
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

			// If this temporary Map has a smaller size than minMapSize, replace the selectedPossibleTargetsArr and update (reduce) minMapSize
			if (tempMapSize < minMapSize) {
				selectedPossibleTargetsArr = [tempSelectedPossibleTargets]
				minMapSize = tempMapSize
			} else if (tempMapSize === minMapSize) {
				selectedPossibleTargetsArr.push(tempSelectedPossibleTargets)
			}

			// Use a set from selectedPossibleTargetsArr. Choose randomly, as they are equivalent
			const idx = randomInt(0, selectedPossibleTargetsArr.length - 1)
			// console.log(idx, selectedPossibleTargetsArr)
			this.#selectedPossibleTargets = selectedPossibleTargetsArr[idx]
		}
	}

	/* probabilistic Strategy */
	#getOpponentTargetCellCoordsProbabilistic() {
		this.#computeCellsProbabilities()

		// get the cells with the maximum probability
		let maxFrequency = 0
		let maxFrequenciesCoordsKeys = []

		this.#targetFrequencies.entries().forEach(([key, frequency]) => {
			if (frequency > maxFrequency) {
				maxFrequenciesCoordsKeys = [key]
				maxFrequency = frequency
			} else if (frequency == maxFrequency) {
				maxFrequenciesCoordsKeys.push(key)
			}
		})

		// Randomly select one cells coords among maxFrequenciesCoordsKeys
		const idx = randomInt(0, maxFrequenciesCoordsKeys.length - 1)

		return this.#possibleTargets.get(maxFrequenciesCoordsKeys[idx])
	}

	#applyPostAttackActionsProbabilistic(cellCoords, outcome) {
		// Delete current cell from possible targets
		this.#possibleTargets.delete(arr2str(cellCoords))

		// If hit, add cell to hit targets (which does not include sunk ship targets)
		if (outcome.isHit) {
			this.#hitTargets.set(arr2str(cellCoords), cellCoords)
		}

		// If sunk, remove ship coords from hit targets (which does not include sunk ship targets)
		if (outcome.isSunk) {
			const sunkShipCoords = outcome.sunkShipCoords[0]

			sunkShipCoords.forEach((coords) =>
				this.#hitTargets.delete(arr2str(coords))
			)
		}
	}

	#computeCellsProbabilities() {
		// Initialize the frequencies map
		const frequencies = new Map()
		this.#possibleTargets.keys().forEach((key) => frequencies.set(key, 0))

		// For each ship length
		for (const shipSize of this.#opponentShipSizes) {
			// For each possible target
			for (const [col, row] of this.#possibleTargets.values()) {
				// For each possible direction
				forDirection: for (const [dCol, dRow] of neighboursCellDisplacement) {
					const tempCellsKeys = []
					let hits = 0
					// const tempStr = `ship of length ${shipSize} in cell (${col},${row}) along ${dRow > 0 ? "S" : dRow < 0 ? "N" : dCol > 0 ? "E" : "W"}`

					// check if the ship can fit: start from the end, so you could stop early if they overflow
					for (let delta = shipSize - 1; delta >= 0; delta--) {
						const [c, r] = [col + dCol * delta, row + dRow * delta]
						const tempKey = arr2str([c, r])
						const isHit = this.#hitTargets.has(tempKey)

						// check if the cell could be occupied by this ship
						// i.e., either it is in the possible (not attacked) targets or hit (but unsunk)
						// if not, try next ship direction
						if (!this.#possibleTargets.has(tempKey) && !isHit) {
							// console.log("no", tempStr)
							continue forDirection
						}

						// if hit, increment the hits counter, else save this cell label
						if (isHit) {
							hits++
						} else {
							tempCellsKeys.push(tempKey)
						}
					}
					// Increment the counter for eeach cell that would be occupied by the ship
					// Note: if there are some hits, this is weighted 100**hits instead of 1
					// This helps prioritizing the cells close to the hit ones.
					// Note: each ship is counted twice (it can be placed in two opposite directions)

					// const strTempCells = tempCellsKeys.map((key) => `(${key})`)
					// console.log("ALLOWED", tempStr, "-->", ...strTempCells)

					const increment = hits === 0 ? 1 : 100 ** hits

					tempCellsKeys.forEach((key) => {
						const frequency = frequencies.get(key)
						frequencies.set(key, frequency + increment)
					})
				}
			}
		}
		console.log(frequencies)
		this.#targetFrequencies = frequencies
	}

	/* improvedProbabilistic Strategy */
	#getOpponentTargetCellCoordsImprovedProbabilistic() {
		// in target mode: apply the probabilistic approach
		if (this.#hitTargets.size > 0) {
			return this.#getOpponentTargetCellCoordsProbabilistic()
		}

		// hunt mode: consider just the selected sells (see improved hunt target approach)
		// consider the this.#selectedPossibleTargets list
		this.#computeCellsProbabilities()

		// get the squared frequencies of the selected targets
		const targetFrequencies = new Map()
		this.#selectedPossibleTargets
			.keys()
			.forEach((key) =>
				targetFrequencies.set(key, this.#targetFrequencies.get(key) ** 2)
			)

		// compute the sum of such selected frequencies
		const sum = targetFrequencies
			.values()
			.reduce((sum, frequency) => sum + frequency, 0)

		// get a cell randomly, taking into account such probabilities
		const rand = randomInt(0, sum - 1)
		let cumsum = 0

		for (const [key, frequency] of targetFrequencies) {
			cumsum += frequency

			if (cumsum > rand) {
				return this.#selectedPossibleTargets.get(key)
			}
		}
	}

	#applyPostAttackActionsImprovedProbabilistic(cellCoords, outcome) {
		this.#applyPostAttackActionsProbabilistic(cellCoords, outcome)

		// delete the coords from the selectedPossibleTargets, too
		this.#selectedPossibleTargets.delete(arr2str(cellCoords))

		// if the ship is sunk, update the opponentMinShipSize
		if (outcome.isSunk) {
			this.#removeOpponentSunkShipSize(outcome.sunkShip.length)
		}
	}
}
