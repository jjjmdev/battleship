import PubSub from "pubsub-js"
import {
	initDiv,
	initP,
	initButton,
	initHeader,
} from "../utils/domComponents.js"
import PlayerDom from "./PlayerDom.js"
import { pubSubTokens, pubSubTokensUi } from "../pubSubTokens.js"

const blockName = "game"
const cssClass = {
	header: "header",
	playersDiv: "players-div",
	playerDiv: "player-div",
	msgP: "msg-p",
}

const getCssClass = (element) => `${blockName}__${cssClass[element]}`

export default class GameViewDom {
	#div
	#playersDom
	#currentPlayer
	#showCurrentPlayerDeployedFleetCallbackBinded

	constructor(player1, player2) {
		this.#showCurrentPlayerDeployedFleetCallbackBinded =
			this.#showCurrentPlayerDeployedFleetCallback.bind(this)

		this.#playersDom = [new PlayerDom(player1), new PlayerDom(player2)]
		this.#div = this.#initGameViewDiv(...this.#playersDom)
		this.#div.obj = this

		// Temporary
		this.#currentPlayer = player1

		PubSub.subscribe(
			pubSubTokens.playersSwitch,
			(token, { player, isAIPlayer }) => {
				this.#currentPlayer = player
				this.isAIPlayer = isAIPlayer
				console.log("SWITCH")
			}
		)
	}

	// Getters
	get div() {
		return this.#div
	}

	#initGameViewDiv(player1Dom, player2Dom) {
		const div = initDiv(blockName)
		const playersDiv = initDiv(getCssClass("playersDiv"))

		const header = this.#initHeader()

		const player1Div = initDiv(getCssClass("playerDiv"))
		player1Div.append(player1Dom.div)
		const player2Div = initDiv(getCssClass("playerDiv"))
		player2Div.append(player2Dom.div)

		playersDiv.append(player1Div, player2Div)
		const msgP = this.#initGameMsg()

		div.append(header, playersDiv, msgP)

		return div
	}

	#initHeader() {
		const header = initHeader(getCssClass("header"))
		const toggleBtn = this.#initToggleFleetBtn()
		header.append(toggleBtn)
		return header
	}

	#initGameMsg() {
		const msg = "A message to show game status"
		return initP(getCssClass("msgP"), msg)
	}

	#initToggleFleetBtn() {
		const btn = initButton(
			"btn",
			this.#showCurrentPlayerDeployedFleetCallbackBinded,
			null,
			"Toggle My Fleet"
		)
		return btn
	}

	#showCurrentPlayerDeployedFleetCallback() {
		PubSub.publish(pubSubTokensUi.toggleDeployedFleetShown(this.#currentPlayer))
	}
}
