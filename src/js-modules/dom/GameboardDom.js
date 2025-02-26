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
	#deployedFleetDom
	#deployedFleetDomShown

	constructor(gameboard) {
		this.#gameboard = gameboard
		this.#cells = new Map()
		this.#div = this.#initGameboardDiv(gameboard)
		this.#div.obj = this

		this.#deployedFleetDom = new Map()
		this.#deployedFleetDomShown = false

		// Temporary code for testing
		this.showDeployedFleet()
		this.toggleDeployedFleet()
		this.toggleDeployedFleet()
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

	#createShipDom(shipName) {
		const shipObj = new ShipDom(
			shipName,
			...this.#gameboard.getShipPosition(shipName)
		)
		return shipObj
	}

	#showShip(shipObj) {
		this.#div.append(shipObj.div)
	}

	#hideShip(shipObj) {
		this.#div.removeChild(shipObj.div)
	}

	showDeployedFleet() {
		this.#gameboard.deployedFleet.forEach((shipName) => {
			let shipObj
			if (!this.#deployedFleetDom.has(shipName)) {
				shipObj = this.#createShipDom(shipName)
				this.#deployedFleetDom.set(shipName, shipObj)
			} else {
				shipObj = this.#deployedFleetDom.get(shipName)
			}

			this.#showShip(shipObj)
		})

		this.#deployedFleetDomShown = true
	}

	hideDeployedFleet() {
		this.#deployedFleetDom.forEach((shipObj) => {
			this.#hideShip(shipObj)
		})
		this.#deployedFleetDomShown = false
	}

	toggleDeployedFleet() {
		if (this.#deployedFleetDomShown) {
			this.hideDeployedFleet()
		} else {
			this.showDeployedFleet()
		}
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
			// Clicking the element underneath an overlay
			const origDisplay = e.target.style.display
			e.target.style.display = "none"
			document.elementFromPoint(e.clientX, e.clientY).click()
			e.target.style.display = origDisplay
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
