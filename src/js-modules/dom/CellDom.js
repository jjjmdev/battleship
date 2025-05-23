const { initDiv } = require("../utils/domComponents.js")

const blockName = "cell"

export default class CellDom {
	#cell
	#div

	constructor(cell) {
		this.#cell = cell
		this.#div = initCellDiv(cell)
		this.#div.obj = this

		// temporary: mark the ships
		// markShip.call(this)
		this.setAttackStatus()
	}

	get div() {
		return this.#div
	}

	get cell() {
		return this.#cell
	}

	setAttackStatus() {
		if (this.cell.hasBeenAttacked()) {
			if (this.cell.hasShip()) {
				this.div.classList.add("hit")
			} else {
				this.div.classList.add("miss")
			}
		}
	}
}

// private methods
// if they use 'this', they have to be evoked as: methodName.call(this,args)

function initCellDiv(cell) {
	const div = initDiv(blockName)
	div.style.gridColumn = cell.x + 1
	div.style.gridRow = cell.y + 1
	div.style.aspectRatio = 1
	return div
}

// function markShip() {
// 	if (this.cell.hasShip()) {
// 		this.div.textContent = "#"
// 	}
// }
