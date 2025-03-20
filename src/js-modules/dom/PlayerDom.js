import PubSub from "pubsub-js"
import { pubSubTokensUi } from "../pubSubTokens.js"
import { initDiv, initH3, initSpan } from "../utils/domComponents.js"
import GameboardDom from "./GameboardDom.js"

const blockName = "player"
const cssClass = {
	playerH3: "player-h3",
	nameSpan: "name-span",
	dividerSpan: "divider-span",
	deployedFleetSizeSpan: "deployed-fleet-size-span",
	textShipSpan: "text-ship-span",
	gameboardCnt: "gameboard",
}

const getCssClass = (element) => `${blockName}__${cssClass[element]}`

export default class PlayerDom {
	#div
	#player
	#gameboardDiv

	constructor(player) {
		this.#player = player
		this.#div = this.#initPlayerDiv(player)
		this.#div.obj = this

		PubSub.subscribe(
			pubSubTokensUi.setCurrentPlayer(player),
			this.#markCurrentPlayer.bind(this)
		)

		PubSub.subscribe(
			pubSubTokensUi.enableAimingOnGameboard(player),
			this.#enableAimingOnGameboard.bind(this)
		)

		PubSub.subscribe(
			pubSubTokensUi.showAttackOutcome(player),
			this.#showAttackOutcome.bind(this)
		)

		PubSub.subscribe(pubSubTokensUi.toggleDeployedFleetShown(player), () =>
			this.#gameboardDiv.obj.toggleDeployedFleet()
		)

		PubSub.subscribe(pubSubTokensUi.hideDeployedFleetShown(player), () =>
			this.#gameboardDiv.obj.hideDeployedFleet()
		)

		PubSub.subscribe(pubSubTokensUi.updateDeployedFleetShown(player), () => {
			this.#gameboardDiv.obj.updateDeployedFleet()
		})
	}

	get player() {
		return this.#player
	}

	get div() {
		return this.#div
	}

	#showAttackOutcome(token, { coords, outcome }) {
		if (outcome.isSunk) {
			PubSub.publish(pubSubTokensUi.shipHasSunk(this.player))
		}

		this.#gameboardDiv.obj.showAttackOutcome(coords, outcome)
	}

	#initPlayerDiv(player) {
		const div = initDiv(blockName)
		const h3 = this.#initHeaderDiv(player)

		const gameboardCnt = initDiv(getCssClass("gameboardCnt"))
		const gameboardDom = new GameboardDom(player.gameboard)
		this.#gameboardDiv = gameboardDom.div
		gameboardCnt.append(this.#gameboardDiv)

		div.append(h3, gameboardCnt)
		return div
	}

	#initHeaderDiv(player) {
		const h3 = initH3(getCssClass("playerH3"))
		const nameSpan = initSpan(getCssClass("nameSpan"))
		const dividerSpan = initSpan(getCssClass("dividerSpan"))
		const deployedFleetSizeSpan = initSpan(getCssClass("deployedFleetSizeSpan"))
		const textShipSpan = initSpan(getCssClass("textShipSpan"))

		nameSpan.textContent = player.name
		dividerSpan.textContent = " - "
		deployedFleetSizeSpan.textContent = player.gameboard.deployedFleet.length
		textShipSpan.textContent =
			player.gameboard.deployedFleet.length > 1 ? " ships" : "ship"

		PubSub.subscribe(pubSubTokensUi.shipHasSunk(this.player), () => {
			const fleetLength = player.gameboard.deployedFleet.length
			deployedFleetSizeSpan.textContent = fleetLength
			textShipSpan.textContent = fleetLength > 1 ? " ships" : " ship"
		})

		h3.append(nameSpan, dividerSpan, deployedFleetSizeSpan, textShipSpan)
		return h3
	}

	#markCurrentPlayer(token, currentPlayer) {
		if (currentPlayer) {
			this.#div.classList.add("currentPlayer")
		} else {
			this.#div.classList.remove("currentPlayer")
		}
	}

	#enableAimingOnGameboard() {
		this.#gameboardDiv.obj.enableAiming()
	}
}
