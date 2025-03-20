import { initDiv, initP, initButton, initHeader } from "../utils/domComponents"
import PlayerDom from "./PlayerDom"
import { pubSubTokens } from "../pubSubTokens"
import PubSub from "pubsub-js"

const blockName = "deploy-fleet"
const cssClass = {
	header: "header",
	playerDiv: "player-div",
	btns: "btns",
	msgP: "msg-p",
}
const getCssClass = (element) => `${blockName}__${cssClass[element]}`

export default class DeployFleetViewDom {
	#div
	#playerDom

	constructor(player, isAi) {
		player.randomShipsPlacement()
		this.#playerDom = new PlayerDom(player)

		this.#div = this.#initDeployFleetViewDiv()
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
		playerDiv.append(this.#playerDom.div)

		const msgP = this.#initGameMsg()

		div.append(header, playerDiv, msgP)

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

	#initGameMsg() {
		// for now, show a temporary msg, to setup the page... the actual message selection is todo..
		const msg = "A message to show game status (TODO)"
		return initP(getCssClass("msgP"), msg)
	}

	#initRandomizeFleetButton() {
		const btn = initButton("btn", () => {}, "button", "Randomize")
		return btn
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
