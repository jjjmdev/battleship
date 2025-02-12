import PubSub from "pubsub-js"
import { initDiv } from "../utils/domComponents.js"
import CellDom from "./CellDom.js"
import { pubSubTokens } from "../pubSubTokens.js"

const blockName = "gameboard"
const cssClass = {}
const getCssClass = (element) => `${blockName}__${cssClass[element]}`

const aimingClass = "aiming"

export default class GameboardDom {
	#gameboard
	#div
	#attackCallback

	constructor(gameboard) {
		this.#gameboard = gameboard
		this.#div = initGameboardDiv(gameboard)
		this.#div.obj = this

		this.enableAiming()
	}

	// getters
	get gameboard() {
		return this.#gameboard
	}

	get div() {
		return this.#div
	}

	enableAiming() {
		this.#div.classList.add(aimingClass)
		this.#attackCallback = this.#getAttackCoordsOnClickCallback.bind(this)
		this.#div.addEventListener("click", this.#attackCallback)
	}

	#getAttackCoordsOnClickCallback(e) {
		// We have subscribed to one event listener for the gameboard:
		// We need to retrieve the appropriate cell
		const targetClassList = e.target.classList
		if (![...targetClassList].includes("cell")) {
			return
		}

		e.preventDefault()

		const cellDiv = e.target
		const cell = cellDiv.obj.cell

		console.log(cell)

		if (!cell.hasBeenAttacked()) {
			// exit aiming mode
			this.#div.classList.remove(aimingClass)
			this.#div.removeEventListener("click", this.#attackCallback)
		}

		PubSub.publish(pubSubTokens.attackCoordsAcquired, cell.coords)
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
