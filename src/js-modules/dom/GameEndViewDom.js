import {
	initDiv,
	initP,
	initButton,
	initHeader,
	initH2,
} from "../utils/domComponents.js"
import { getGameEndMessage } from "../messages.js"

const blockName = "game-end"
const cssClass = {
	header: "header",
	titleH2: "title-h2",
	subtitleP: "subtitle-p",
	playAgainBtn: "play-again-btn",
}

const getCssClass = (element) => `${blockName}__${cssClass[element]}`

export default class GameEndViewDom {
	#div

	constructor(winnerPlayerName, defeatedPlayerName, versusAi, isWinnerAi) {
		const [title, subtitle] = getGameEndMessage(
			winnerPlayerName,
			defeatedPlayerName,
			versusAi,
			isWinnerAi
		)

		this.#div = this.#initGameViewDiv(title, subtitle)
	}

	// getters
	get div() {
		return this.#div
	}

	#initGameViewDiv(title, subtitle) {
		const div = initDiv(blockName)
		const header = initHeader(getCssClass("header"))
		const titleH2 = initH2(getCssClass("titleH2"), title)
		const subtitleP = initP(getCssClass("subtitleP"), subtitle)
		const playAgainBtn = this.#initPlayAgainBtn()

		header.append(titleH2, subtitleP)
		div.append(header, playAgainBtn)

		return div
	}

	#initPlayAgainBtn() {
		const btn = initButton(
			getCssClass("playAgainBtn"),
			this.#initPlayAgainCallback,
			null,
			"PLAY AGAIN"
		)
		return btn
	}

	#initPlayAgainCallback() {
		console.log("PLAY AGAIN, todo")
	}
}
