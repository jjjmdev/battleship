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

	constructor(player) {
		this.#player = player
		this.#div = initPlayerDiv(player)
		this.#div.obj = this
	}

	get player() {
		return this.#player
	}

	get div() {
		return this.#div
	}
}

// private methods
// if they use 'this', they have to be evoked as:
// methodName.call(this.args)

function initPlayerDiv(player) {
	const div = initDiv(blockName)
	const h3 = initNameDiv(player.name)

	const gameboardCnt = initDiv(getCssClass("gameboardCnt"))
	const gameboardDom = new GameboardDom(player.gameboard)
	const gameboardDiv = gameboardDom.div
	gameboardCnt.append(gameboardDiv)

	div.append(h3, gameboardCnt)
	return div
}

function initNameDiv(name) {
	const h3 = initH3(getCssClass("nameH3"))
	h3.textContent = `${name} - 4 ships`
	return h3
}
