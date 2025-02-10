import { initDiv, initP } from "../utils/domComponents.js"
import initMainHeader from "./initMainHeader.js"
import PlayerDom from "./PlayerDom.js"

const blockName = "game"
const cssClass = {
	playersDiv: "players-div",
	playerDiv: "player-div",
	msgP: "msg-p",
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

	const header = initMainHeader()

	const player1Div = initDiv(getCssClass("playerDiv"))
	player1Div.append(player1Dom.div)
	const player2Div = initDiv(getCssClass("playerDiv"))
	player2Div.append(player2Dom.div)

	playersDiv.append(player1Div, player2Div)
	const msgP = initGameMsg()

	div.append(header, playersDiv, msgP)

	return div
}

function initGameMsg() {
	const msg = "A message to show game status"
	return initP(getCssClass("msgP"), msg)
}
