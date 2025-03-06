import {
	initDiv,
	initP,
	initButton,
	initH1,
	initHeader,
} from "../utils/domComponents.js"
import { getHomeViewMessage } from "../messages.js"

const blockName = "home"
const cssClass = {
	header: "header",
	titleH1: "title-h1",
	subtitleP: "subtitle-P",
	play1Player: "play-1-player",
	play2Players: "play-2-players",
	playersBtns: "players-btns",
}

const getCssClass = (element) => `${blockName}__${cssClass[element]}`

export default class HomeViewDom {
	#div

	constructor() {
		const [title, subtitle] = getHomeViewMessage()

		this.#div = this.#initGameViewDiv(title, subtitle)
	}

	// getters
	get div() {
		return this.#div
	}

	#initGameViewDiv(title, subtitle) {
		const div = initDiv(blockName)

		const header = initHeader(getCssClass("header"))
		const titleH1 = initH1(getCssClass("titleH1"), title)
		const subtitleP = initP(getCssClass("subtitleP"), subtitle)

		const playersBtns = initDiv(getCssClass("playersBtns"))
		const play1Player = this.#initPlay1Player()
		const play2Players = this.#initPlay2Players()

		header.append(titleH1, subtitleP)
		playersBtns.append(play1Player, play2Players)
		div.append(header, playersBtns)
		return div
	}

	#initPlay1Player() {
		const btn = initButton(
			getCssClass("play1Player"),
			this.#initPlay1PlayerCallback,
			null,
			"1 PLAYER"
		)
		return btn
	}

	#initPlay1PlayerCallback() {
		console.log("PLAY WITH 1 PLAYER")
	}

	#initPlay2Players() {
		const btn = initButton(
			getCssClass("play2Players"),
			this.#initPlay2PlayersCallback,
			null,
			"2 PLAYERS"
		)
		return btn
	}

	#initPlay2PlayersCallback() {
		console.log("PLAY WITH 2 PLAYERS")
	}
}
