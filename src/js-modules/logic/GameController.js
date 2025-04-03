import Player from "./Player.js"
import AiPlayer from "./AiPlayer.js"
import PubSub from "pubsub-js"
import { randomInt } from "../utils/math.js"
import { pubSubTokens, pubSubTokensUi, pubSubTopicUi } from "../pubSubTokens.js"
import { aiMoveDelay, endGameDelay } from "../delays.js"
import { getFirstPlayerMessage } from "../messages.js"

export default class GameController {
	#player1
	#player2
	#current // Current player turn
	#opponent // Next player turn

	#versusAi

	constructor(player1Name, player2Name, versusAi = true, aiSkills = null) {
		this.#player1 = this.#initPlayer(player1Name)
		this.#player2 = this.#initPlayer(player2Name, versusAi, aiSkills)

		this.#versusAi = versusAi
		this.#initGame()
	}

	/* Player Methods */

	get player1() {
		return this.#player1
	}

	get player2() {
		return this.#player2
	}

	#initPlayer(playerName, isAi = false, aiSkills) {
		if (isAi) {
			return new AiPlayer(playerName, aiSkills)
		} else {
			return new Player(playerName)
		}
	}

	#initCurrentPlayer() {
		// Randomly select the first player
		if (randomInt(0, 1) == 0) {
			this.#current = this.#player1
			this.#opponent = this.#player2
		} else {
			this.#current = this.#player2
			this.#opponent = this.#player1
		}

		if (this.#versusAi) {
			PubSub.publish(pubSubTokensUi.toggleDeployedFleetShown(this.#player1))
		}

		PubSub.publish(pubSubTokens.playersSwitch, {
			player: this.#current,
			isAIPlayer: this.#isAIPlayer(),
		})
	}

	#switchCurrentPlayer() {
		;[this.#current, this.#opponent] = [this.#opponent, this.#current]

		PubSub.publish(pubSubTokens.playersSwitch, {
			player: this.#current,
			isAIPlayer: this.#isAIPlayer(),
		})

		if (!this.#versusAi) {
			PubSub.publish(pubSubTokensUi.hideDeployedFleetShown(this.#opponent))
		}
	}

	#isAIPlayer() {
		return this.#current instanceof AiPlayer
	}

	/* Init game methods */
	#initGame() {
		// Start by deploying player 1 fleet: player 2 fleet will be deployed next
		this.#deployPlayer1Fleet()
	}

	/* Fleet deployment methods */
	#deployPlayer1Fleet() {
		PubSub.subscribe(
			pubSubTokens.fleetDeployed,
			this.#deployPlayer2Fleet.bind(this)
		)

		PubSub.publish(pubSubTokens.showDeployFleetView, {
			player: this.#player1,
			isAi: false,
			isPlayer1: true,
			versusAi: this.#versusAi,
		})
	}

	#deployPlayer2Fleet() {
		PubSub.unsubscribe(pubSubTokens.fleetDeployed)
		PubSub.unsubscribe(pubSubTokensUi)
		PubSub.subscribe(pubSubTokens.fleetDeployed, this.#initGameView.bind(this))

		PubSub.publish(pubSubTokens.showDeployFleetView, {
			player: this.#player2,
			isAi: this.#versusAi,
			isPlayer1: false,
			versusAi: this.#versusAi,
		})
	}

	#initGameView() {
		PubSub.unsubscribe(pubSubTokens.fleetDeployed)
		PubSub.unsubscribe(pubSubTokensUi)

		PubSub.subscribe(
			pubSubTokens.gameViewInitialized,
			this.#playGame.bind(this)
		)

		PubSub.publish(pubSubTokens.showGameView, {
			player1: this.#player1,
			player2: this.#player2,
			versusAi: this.#versusAi,
		})
	}

	#playGame() {
		PubSub.unsubscribe(pubSubTokens.gameViewInitialized)

		this.#initCurrentPlayer()
		this.#consoleLogMessage("startGame")
		const statusMsg = getFirstPlayerMessage(
			this.#current.name,
			this.#versusAi,
			this.#isAIPlayer()
		)
		PubSub.publish(pubSubTokensUi.setGameStatusMsg, statusMsg)

		// Continue playing until someone wins, or
		// no more moves are allowed
		PubSub.subscribe(pubSubTokens.playTurn, this.#playTurn.bind(this))
		// Play the first turn
		this.#playTurn()
	}

	#playTurn() {
		this.#consoleLogMessage("startTurn")

		PubSub.publish(pubSubTokensUi.setCurrentPlayer(this.#current), true)
		PubSub.publish(pubSubTokensUi.setCurrentPlayer(this.#opponent), false)

		// First, subscribe to the token that perform the attack
		// when its coords are acquired
		PubSub.subscribe(
			pubSubTokens.attackCoordsAcquired,
			this.#attackCoordsAcquiredCallback.bind(this)
		)

		this.#getAttackCoords()
	}

	#attackCoordsAcquiredCallback(token, coords) {
		PubSub.unsubscribe(pubSubTokens.attackCoordsAcquired)

		// Perform actions based on hit or miss outcome
		PubSub.subscribe(
			pubSubTokens.attackOutcomeShown,
			this.#attackOutcomeShownCallback.bind(this)
		)

		// Attack the opponent and get outcome info
		const outcome = this.#attackTheOpponent(coords)
		// Perform actions based on hit or miss outcome (todo)
		setTimeout(
			() => this.#showAttackOutcome(coords, outcome),
			this.#isAIPlayer() ? aiMoveDelay : 0
		)
	}

	#getAttackCoords() {
		if (this.#isAIPlayer()) {
			const coords = this.#current.getOpponentTargetCellCoords()
			PubSub.publish(pubSubTokens.attackCoordsAcquired, coords)
		} else {
			PubSub.publish(pubSubTokensUi.enableAimingOnGameboard(this.#opponent))
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

		const sunkShipCoords = isSunk
			? this.#opponent.gameboard.getShipPosition(sunkShip.name)
			: null

		return { isHit, isSunk, isWin, sunkShip, sunkShipCoords }
	}

	#applyPostAttackActions(coords, outcome) {
		if (this.#isAIPlayer()) {
			this.#current.applyPostAttackActions(coords, outcome)
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
					outcome.isSunk ? " and sunk" : ""
				}`
				const sunkShip = outcome.isSunk
					? ` ship of size: ${outcome.sunkShip.length}`
					: ""
				return `Attacks ${coordsStr} > ${outcomeStr}${sunkShip}`
			},
			endGame: () => `${this.#current.name} WINS!`,
		}

		console.log(message[label](data))
	}

	#showAttackOutcome(coords, outcome) {
		this.#consoleLogMessage("attackInfo", { coords, outcome })

		PubSub.publish(pubSubTokensUi.showAttackOutcome(this.#opponent), {
			coords,
			outcome,
		})
	}

	#attackOutcomeShownCallback(token, { coords, outcome }) {
		// First, unsubscribe from attackOutcomeShown token
		PubSub.unsubscribe(pubSubTokens.attackOutcomeShown)

		// End the game if the current player wins
		if (outcome.isWin) {
			this.#consoleLogMessage("endGame")
			PubSub.unsubscribe(pubSubTokens.playTurn)
			PubSub.unsubscribe(pubSubTopicUi) // remove all UI PubSub subscriptions

			setTimeout(
				() =>
					PubSub.publish(pubSubTokens.showGameEndView, {
						winnerPlayerName: this.#current.name,
						defeatedPlayerName: this.#opponent.name,
						versusAi: this.#versusAi,
						isWinnerAi: this.#isAIPlayer(),
					}),
				endGameDelay
			)
			return
		}

		// Perform post-attack actions
		this.#applyPostAttackActions(coords, outcome)
		// Pass turn to opponent
		this.#switchCurrentPlayer()

		PubSub.publish(pubSubTokens.playTurn)
	}
}
