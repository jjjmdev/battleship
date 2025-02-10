const { initDiv } = require("../utils/domComponents.js")

const blockName = "cell"
const cssClass = {}
const getCssClass = (element) => `${blockName}__${cssClass[element]}`

export default class CellDom {
	#cell
	#div

	constructor(cell) {
		this.#cell = cell
		this.#div = initCellDiv(cell)
		this.#div.obj = this
	}

	get div() {
		return this.#div
	}

	get cell() {
		return this.#cell
	}
}

// private methods
// if they use 'this', they have to be evoked as: methodName.call(this,args)

function initCellDiv(cell) {
	const div = initDiv(blockName)
	div.style.gridColumn = cell.x + 1
	div.style.gridRow = cell.y + 1
	div.style.aspectRatio = 1
	div.style.border = "1px solid darkblue"
	return div
}
