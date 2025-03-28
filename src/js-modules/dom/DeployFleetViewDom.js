import {
	initDiv,
	initP,
	initButton,
	initHeader,
} from "../utils/domComponents.js"
import PlayerDom from "./PlayerDom.js"
import { pubSubTokens, pubSubTokensUi } from "../pubSubTokens.js"
import { getEditInstructionsMessage } from "../../js-modules/messages.js"
import PubSub from "pubsub-js"

const blockName = "deploy-fleet"
const cssClass = {
	header: "header",
	playerDiv: "player-div",
	btns: "btns",
	msgP: "msg-p",
	editInstructionsP: "edit-instructions-p",
}
const getCssClass = (element) => `${blockName}__${cssClass[element]}`

const deployFleetAiDelay = 10000 // ms

export default class DeployFleetViewDom {
	#div
	#playerDom

	constructor(player, isAi) {
		player.randomShipsPlacement()

		if (!isAi) {
			this.#playerDom = new PlayerDom(player, true)

			this.#div = this.#initDeployFleetViewDiv()
		} else {
			this.#div = this.#initAiDeployFleetViewDiv()

			// Notify the initialization of the fleet for the AI
			setTimeout(
				() => PubSub.publish(pubSubTokens.fleetDeployed),
				deployFleetAiDelay
			)
		}
	}

	// Getters
	get div() {
		return this.#div
	}

	#initDeployFleetViewDiv() {
		const div = initDiv(blockName)
		// todo
		const header = this.#initHeader()
		const playerDiv = initDiv(getCssClass("playerDiv"))
		this.#playerDom.div.append(this.#initEditInstructions())
		playerDiv.append(this.#playerDom.div)

		// show the ships
		PubSub.publish(
			pubSubTokensUi.toggleDeployedFleetShown(this.#playerDom.player)
		)

		const msgP = this.#initGameMsg()
		div.append(header, playerDiv, msgP)

		return div
	}

	#initAiDeployFleetViewDiv() {
		const div = initDiv(blockName)
		const msg = this.#initGameMsg()
		div.append(msg)
		return div
	}

	#initHeader() {
		const header = initHeader(getCssClass("header"))

		const buttonsDiv = initDiv(getCssClass("btns"))
		const showFleetBtn = this.#initRandomizeFleetButton()
		const fleetReadyBtn = this.#initFleetReadyButton()

		buttonsDiv.append(showFleetBtn, fleetReadyBtn)
		header.append(buttonsDiv)

		return header
	}

	#initEditInstructions() {
		const msg = getEditInstructionsMessage()
		return initP(getCssClass("editInstructionsP"), msg)
	}

	#initGameMsg() {
		// for now, show a temporary msg, to setup the page... the actual message selection is todo..
		const msg = "A message to show game status (TODO)"
		return initP(getCssClass("msgP"), msg)
	}

	#initRandomizeFleetButton() {
		const btn = initButton(
			"btn",
			this.#randomizeFleetCallback.bind(this),
			"button",
			"Randomize"
		)
		return btn
	}

	#randomizeFleetCallback() {
		this.#playerDom.player.repeatRandomShipsPlacement()

		PubSub.publish(
			pubSubTokensUi.updateDeployedFleetShown(this.#playerDom.player)
		)
	}

	#initFleetReadyButton() {
		const btn = initButton(
			"btn",
			this.#fleetReadyCallback,
			"button",
			"I'M READY!"
		)
		return btn
	}

	#fleetReadyCallback() {
		// Notify the initialization of the page
		PubSub.publish(pubSubTokens.fleetDeployed)
	}
}
