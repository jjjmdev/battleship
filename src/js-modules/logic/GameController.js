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

	/* Player Methods */

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

	#switchCurrentPlayer() {
		;[this.#current, this.#opponent] = [this.#opponent, this.#current]
	}

	#isAIPlayer() {
		return this.#current instanceof AiPlayer
	}

	/* Gameplay Methods */
	#initGame() {
		this.#deployFleet()
		this.#initGameView()
	}

	#deployFleet() {
		this.#player1.randomShipsPlacement()
		this.#player2.randomShipsPlacement()
	}

	#initGameView() {
		PubSub.subscribe(
			pubSubTokens.gameViewInitialized,
			this.#playGame.bind(this)
		)

		PubSub.publish(pubSubTokens.initGameView, {
			player1: this.#player1,
			player2: this.#player2,
		})
	}

	#playGame() {
		PubSub.unsubscribe(pubSubTokens.gameViewInitialized)

		this.#initCurrentPlayer()
		this.#consoleLogMessage("startGame")

		// Continue playing until someone wins, or
		// no more moves are allowed
		PubSub.subscribe(pubSubTokens.playTurn, this.#playTurn.bind(this))
		// Play the first turn
		this.#playTurn()
	}

	#playTurn() {
		this.#consoleLogMessage("startTurn")

		// Get the coords of the move
		const coords = this.#getAttackCoords()
		// Attack the opponent and get outcome info
		const outcome = this.#attackTheOpponent(coords)
		// Perform actions based on hit or miss outcome (todo)
		this.#consoleLogMessage("attackInfo", { coords, outcome })

		// End the game if the current player wins
		if (outcome.isWin) {
			this.#consoleLogMessage("endGame")
			PubSub.unsubscribe(pubSubTokens.playTurn)
			return
		}

		// Perform post-attack actions
		this.#applyPostAttackActions(coords)
		// Pass turn to opponent
		this.#switchCurrentPlayer()
		PubSub.publish(pubSubTokens.playTurn)
	}

	#getAttackCoords() {
		if (this.#isAIPlayer()) {
			return this.#current.getOpponentTargetCellCoords()
		} else {
			// default, todo
			return [0, 0]
		}
	}

	#attackTheOpponent(coords) {
		// attacks and returns an object with info about the outcome of the attack
		const outcomeCode = this.#opponent.gameboard.receiveAttack(coords)

		const isHit = outcomeCode > 0
		const isSunk = outcomeCode == 2
		const isWin = !this.#opponent.gameboard.hasDeployedShips()

		// The player can only know the hit ship if this gets sunk
		const sunkShip = isSunk
			? this.#opponent.gameboard.getCell(coords).getShip()
			: null

		return { isHit, isSunk, isWin, sunkShip }
	}

	#applyPostAttackActions(coords) {
		if (this.#isAIPlayer()) {
			this.#current.applyPostAttackActions(coords)
		} else {
			// todo
		}
	}

	#consoleLogMessage(label, data = {}) {
		const message = {
			startGame: () => `${this.#current.name} starts.`,
			startTurn: () => `${this.#current.name}'s turn.`,
			attackInfo: ({ coords, outcome }) => {
				const coordsStr = `[${coords[0]},${coords[1]}]`
				const outcomeStr = `${outcome.isHit ? "hit" : "miss"}${
					outcome.isSunk ? "and sunk" : ""
				}`
				const sunkShip = outcome.isSunk
					? ` (${outcome.sunkShip.name}, length: ${outcome.sunkShip.length})`
					: ""
				return `Attacks ${coordsStr} > ${outcomeStr}${sunkShip}`
			},
			endGame: () => `${this.#current.name} WINS!`,
		}

		console.log(message[label](data))
	}
}
