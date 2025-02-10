import { initDiv } from "../utils/domComponents.js"
import PlayerDom from "./PlayerDom.js"

const blockName = "game"
const cssClass = {
	playersDiv: "players-div",
}

const getCssClass = (element) => `${blockName}__${cssClass[element]}`

export default class GameViewDom {
	#div
	#playersDom

	constructor(player1, player2) {
		this.#playersDom = [new PlayerDom(player1), new PlayerDom(player2)]
		this.#div = initGameViewDiv(...this.#playersDom)
		this.#div.obj = this
	}

	// Getters
	get div() {
		return this.#div
	}
}

function initGameViewDiv(player1Dom, player2Dom) {
	const div = initDiv(blockName)
	const playersDiv = initDiv(getCssClass("playersDiv"))

	playersDiv.append(player1Dom.div, player2Dom.div)
	div.append(playersDiv)

	return div
}
