import { initDiv } from "../utils/domComponents.js"
import CellDom from "./CellDom.js"

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

	// Forced grid appearance
	div.style.display = "grid"
	div.style.aspectRatio = `${gameboard.nCols}/${gameboard.nRows}`
	div.style.gridTemplateColumns = `repeat(${gameboard.nCols}, minmax(0, 1fr))`
	div.style.gridTemplateRows = `repeat(${gameboard.nRows}, minmax(0, 1fr))`

	const cells = gameboard.cells
	cells.forEach((column) => {
		column.forEach((cell) => {
			const cellDom = new CellDom(cell)
			div.append(cellDom.div)
		})
	})

	return div
}
