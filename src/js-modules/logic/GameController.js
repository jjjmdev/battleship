import Player from "./Player.js"
import AiPlayer from "./AiPlayer.js"

export default class GameController {
	#player1
	#player2

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
	}

	#deployFleet() {
		this.#player1.randomShipsPlacement()
		this.#player2.randomShipsPlacement()
	}
}
