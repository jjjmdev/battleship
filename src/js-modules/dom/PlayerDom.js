import PubSub from "pubsub-js"
import { pubSubTokensUi } from "../pubSubTokens.js"
import { initDiv, initH3 } from "../utils/domComponents.js"
import GameboardDom from "./GameboardDom.js"

const blockName = "player"
const cssClass = {
	nameH3: "name-h3",
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
			pubSubTokensUi.enableAimingOnGameboard(player),
			this.#enableAimingOnGameboard.bind(this)
		)

		PubSub.subscribe(
			pubSubTokensUi.showAttackOutcome(player),
			this.#showAttackOutcome.bind(this)
		)
	}

	get player() {
		return this.#player
	}

	get div() {
		return this.#div
	}

	#showAttackOutcome(token, { coords, outcome }) {
		this.#gameboardDiv.obj.showAttackOutcome(coords, outcome)
	}

	#initPlayerDiv() {
		const div = initDiv(blockName)
		const h3 = this.#initNameDiv(this.player.name)

		const gameboardCnt = initDiv(getCssClass("gameboardCnt"))
		const gameboardDom = new GameboardDom(this.player.gameboard)
		this.#gameboardDiv = gameboardDom.div
		gameboardCnt.append(this.#gameboardDiv)

		div.append(h3, gameboardCnt)
		return div
	}

	#initNameDiv(name) {
		const h3 = initH3(getCssClass("nameH3"))
		h3.textContent = `${name} - 4 ships`
		return h3
	}

	#enableAimingOnGameboard() {
		this.#gameboardDiv.obj.enableAiming()
	}
}

// private methods
// if they use 'this', they have to be evoked as:
// methodName.call(this.args)
