import {
	initDiv,
	initP,
	initButton,
	initHeader,
	initH1,
	initInput,
} from "../utils/domComponents.js"
import { getHomeViewMessage } from "../messages.js"
import GameController from "../logic/GameController.js"

const blockName = "players-name"
const cssClass = {
	header: "header",
	titleH1: "title-h1",
	subtitleP: "subtitle-p",
	playBtn: "play-btn",
	playersCntDiv: "players-cnt-div",
	playerDiv: "player-div",
	playerNameP: "player-name-p",
	playerTitleP: "player-title-p",
	playerNameInput: "player-name-input",
	vsP: "vs-p",
}
const getCssClass = (element) => `${blockName}__${cssClass[element]}`

const defaultData = {
	player1: { title: "Captain", name: "Hook" },
	player2: { title: "Captain", name: "Finch" },
	aiPlayer: { title: "Captain", name: "AI" },
}

export default class PlayersNameViewDom {
	#versusAi
	#div
	#playersName = []

	constructor(versusAi) {
		this.#versusAi = versusAi
		this.#div = this.#initGameViewDiv()
	}

	// Getters
	get div() {
		return this.#div
	}

	#initGameViewDiv() {
		const div = initDiv(blockName)
		const header = initHeader(getCssClass("header"))
		const [title, subtitle] = getHomeViewMessage()
		const titleH1 = initH1(getCssClass("titleH1"), title)
		const subtitleP = initP(getCssClass("subtitleP"), subtitle)
		const playersSelection = this.#initPlayersSelection()
		const playBtn = this.#initPlayBtn()

		header.append(titleH1, subtitleP)
		div.append(header, playersSelection, playBtn)

		return div
	}

	#initPlayCallback() {
		// Create a new game controller (this triggers the start of the game,
		// once initialized)
		// console.log(this.#playersName)
		new GameController(...this.#playersName, this.#versusAi)
	}

	#initPlayBtn() {
		const btn = initButton(
			getCssClass("playBtn"),
			this.#initPlayCallback.bind(this),
			null,
			"Set sails!"
		)

		return btn
	}

	#initPlayersSelection() {
		const playersCntDiv = initDiv(getCssClass("playersCntDiv"))

		const player1Div = this.#initPlayerNameDiv(defaultData.player1)
		const vsP = initP(getCssClass("vsP"), "vs")
		const player2Div = this.#versusAi
			? this.#initAiPlayerNameDiv(defaultData.aiPlayer)
			: this.#initPlayerNameDiv(defaultData.player2)

		playersCntDiv.append(player1Div, vsP, player2Div)

		return playersCntDiv
	}

	#initPlayerNameDiv({ title, name }) {
		const playerId = this.#playersName.length
		const playerCntDiv = initDiv(getCssClass("playerDiv"))
		const playerTitleP = initP(getCssClass("playerTitleP"), title)
		const playerNameInput = initInput(
			getCssClass("playerNameInput"),
			`${getCssClass("playerNameInput")}_${playerId}`,
			`playerName_${playerId}`,
			name,
			false
		)

		playerCntDiv.append(playerTitleP, playerNameInput)

		const setPlayerName = () => {
			this.#playersName[playerId] = `${playerTitleP.textContent.trim()} ${
				playerNameInput.value != ""
					? playerNameInput.value.trim()
					: playerNameInput.placeholder.trim()
			}`
		}
		setPlayerName()
		playerNameInput.addEventListener("input", setPlayerName.bind(this))

		return playerCntDiv
	}

	#initAiPlayerNameDiv({ title, name }) {
		const playerId = this.#playersName.length
		const playerCntDiv = initDiv(getCssClass("playerDiv"))
		const playerTitleP = initP(getCssClass("playerTitleP"), title)
		const playerNameP = initP(getCssClass("playerNameP"), name)
		playerCntDiv.append(playerTitleP, playerNameP)

		const setPlayerName = () => {
			this.#playersName[
				playerId
			] = `${playerTitleP.textContent.trim()} ${playerNameP.textContent.trim()}`
		}
		setPlayerName()

		return playerCntDiv
	}
}
