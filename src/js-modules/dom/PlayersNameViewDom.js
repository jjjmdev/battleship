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
	aiPlayerDiv: "ai-player-div",
	prevAiBtn: "prev-ai-btn",
	nextAiBtn: "next-ai-btn",
	playerNameP: "player-name-p",
	playerTitleP: "player-title-p",
	playerNameInput: "player-name-input",
	vsP: "vs-p",
}
const getCssClass = (element) => `${blockName}__${cssClass[element]}`

const aiPlayers = [
	{ title: "Captain", name: "Novice", skills: "random" },
	{ title: "Captain", name: "Intermediate", skills: "huntTarget" },
	{ title: "Captain", name: "Advanced", skills: "improvedHuntTarget" },
	{ title: "Captain", name: "Expert", skills: "probabilistic" },
	{ title: "Captain", name: "Master", skills: "improvedProbabilistic" },
]
const defaultData = {
	player1: { title: "Captain", name: "Hook" },
	player2: { title: "Captain", name: "Finch" },
	aiPlayerIdx: 2,
}

export default class PlayersNameViewDom {
	#versusAi
	#div
	#playersName = []
	#aiPlayerIdx
	#aiSkills

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
		new GameController(...this.#playersName, this.#versusAi, this.#aiSkills)
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
		const vsP = initP(getCssClass("vsP"), "VS")
		const player2Div = this.#versusAi
			? this.#initAiPlayerNameDiv(defaultData.aiPlayerIdx)
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
		playerNameInput.maxLength = 15

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

	#initAiPlayerNameDiv(aiPlayerIdx) {
		this.#aiPlayerIdx = aiPlayerIdx

		const playerId = this.#playersName.length
		const playerCntDiv = initDiv([
			getCssClass("playerDiv"),
			getCssClass("aiPlayerDiv"),
		])

		const playerNameP = initP(getCssClass("playerNameP"))
		const playerTitleP = initP(getCssClass("playerTitleP"))

		const setPlayerName = () => {
			this.#playersName[
				playerId
			] = `${playerTitleP.textContent.trim()} ${playerNameP.textContent.trim()}`
		}

		const setAiPlayer = () => {
			prevAiBtn.disabled = this.#aiPlayerIdx === 0
			nextAiBtn.disabled = this.#aiPlayerIdx === aiPlayers.length - 1

			const { title, name, skills } = aiPlayers[this.#aiPlayerIdx]

			playerNameP.textContent = name
			playerTitleP.textContent = title
			this.#aiSkills = skills

			setPlayerName()
		}

		// Callbacks
		const prevAiCallback = () => {
			this.#aiPlayerIdx--
			setAiPlayer()
		}

		const nextAiCallback = () => {
			this.#aiPlayerIdx++
			setAiPlayer()
		}

		const prevAiBtn = initButton(
			getCssClass("prevAiBtn"),
			prevAiCallback.bind(this),
			null,
			"<"
		)
		const nextAiBtn = initButton(
			getCssClass("nextAiBtn"),
			nextAiCallback.bind(this),
			null,
			">"
		)

		playerCntDiv.append(prevAiBtn, playerTitleP, playerNameP, nextAiBtn)

		// Init AI player
		setAiPlayer()

		return playerCntDiv
	}
}
