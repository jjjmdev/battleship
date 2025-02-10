import { initDiv } from "../utils/domComponents.js"

const blockName = "gameboard"
const cssClass = {}
const getCssClass = (element) => `${blockName}__${cssClass[element]}`

export default class GameboardDom {
	#gameboard
	#div

	constructor(gameboard) {
		this.#gameboard = gameboard
		this.#div = initGameboardDiv(gameboard)
		this.#div.obj = this
	}

	// getters
	get gameboard() {
		return this.#gameboard
	}

	get div() {
		return this.#div
	}
}

// private methods
// if they use 'this', they have to be evoked as:
// methodName.call(this.args)
function initGameboardDiv(gameboard) {
	const div = initDiv(blockName)

	const cells = gameboard.cells
	cells.forEach((column) => {
		column.forEach((cell) => {
			const cellDiv = initDiv("cell")
			cellDiv.textContent = cell.coords
			div.append(cellDiv)
		})
	})

	return div
}
