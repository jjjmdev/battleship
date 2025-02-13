import PubSub from "pubsub-js"
import { pubSubTokens } from "../pubSubTokens.js"
import { initDiv } from "../utils/domComponents.js"
import CellDom from "./CellDom.js"
import ShipDom from "./ShipDom.js"

const blockName = "gameboard"
const cssClass = {}
const getCssClass = (element) => `${blockName}__${cssClass[element]}`

const aimingClass = "aiming"

export default class GameboardDom {
	#gameboard
	#div
	#attackCallback
	#cells

	constructor(gameboard) {
		this.#gameboard = gameboard
		this.#cells = new Map()
		this.#div = this.#initGameboardDiv(gameboard)
		this.#div.obj = this

		const shipObj = new ShipDom([
			[0, 0],
			[0, 1],
			[0, 2],
		])
		const shipObj2 = new ShipDom([
			[1, 1],
			[2, 1],
			[3, 1],
			[4, 1],
		])
		this.#div.append(shipObj.div, shipObj2.div)
	}

	// getters
	get gameboard() {
		return this.#gameboard
	}

	get div() {
		return this.#div
	}

	showAttackOutcome(coords, outcome) {
		const cellDom = this.#cells.get(coords.join(","))
		cellDom.setAttackStatus()
		PubSub.publish(pubSubTokens.attackOutcomeShown, { coords, outcome })
	}

	enableAiming() {
		this.#div.classList.add(aimingClass)
		this.#attackCallback = this.#getAttackCoordsOnClickCallback.bind(this)
		this.#div.addEventListener("click", this.#attackCallback)
	}

	#initGameboardDiv(gameboard) {
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
				this.#cells.set(cell.coords.join(","), cellDom)
				div.append(cellDom.div)
			})
		})

		return div
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

		if (!cell.hasBeenAttacked()) {
			// exit aiming mode
			this.#div.classList.remove(aimingClass)
			this.#div.removeEventListener("click", this.#attackCallback)
		}

		PubSub.publish(pubSubTokens.attackCoordsAcquired, cell.coords)
	}
}
