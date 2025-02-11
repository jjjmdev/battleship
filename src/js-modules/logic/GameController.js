import Player from "./Player.js"
import AiPlayer from "./AiPlayer.js"
import PubSub from "pubsub-js"
import { pubSubTokens } from "../pubSubTokens.js"

export default class GameController {
	#player1
	#player2
	#current // Current player turn
	#opponent // Next player turn

	constructor(player1Name, player2Name, versusAi = true) {
		this.#player1 = this.#initPlayer(player1Name)
		this.#player2 = this.#initPlayer(player2Name, versusAi)

		this.#initGame()
	}

	get player1() {
		return this.#player1
	}

	get player2() {
		return this.#player2
	}

	#initPlayer(playerName, isAi = false) {
		if (isAi) {
			return new AiPlayer(playerName)
		} else {
			return new Player(playerName)
		}
	}

	#initGame() {
		this.#deployFleet()
		this.#initCurrentPlayer()
		this.#initGameView()
	}

	#deployFleet() {
		this.#player1.randomShipsPlacement()
		this.#player2.randomShipsPlacement()
	}

	#initCurrentPlayer() {
		// Random
		if (Math.random() < 0.5) {
			this.#current = this.#player1
			this.#opponent = this.#player2
		} else {
			this.#current = this.#player2
			this.#opponent = this.#player1
		}
	}
	// eslint-disable-next-line no-unused-private-class-members
	#switchCurrentPlayer() {
		;[this.#current, this.#opponent] = [this.#opponent, this.#current]
	}

	#initGameView() {
		PubSub.publish(pubSubTokens.initGameView, {
			player1: this.#player1,
			player2: this.#player2,
		})
	}
}
