import GameViewDom from "./dom/GameViewDom.js"
import GameEndViewDom from "./dom/GameEndViewDom.js"
import GameController from "./logic/GameController.js"
import PubSub from "pubsub-js"
import { pubSubTokens } from "./pubSubTokens.js"
import { removeDescendants } from "./utils/domUtilities.js"

const container = document.body

export default function initWebpage() {
	const player1Name = "Captain X"
	const player2Name = "Captain Y"
	const versusAi = true

	PubSub.subscribe(pubSubTokens.showGameView, renderGameViewDom)
	PubSub.subscribe(pubSubTokens.showGameEndView, renderGameViewEndDom)

	new GameController(player1Name, player2Name, versusAi)
}

function renderGameViewDom(token, { player1, player2 }) {
	removeDescendants(container)
	const gameViewDom = new GameViewDom(player1, player2)
	container.append(gameViewDom.div)
	// Notify the initialization of the page
	PubSub.publish(pubSubTokens.gameViewInitialized, renderGameViewDom)
}

function renderGameViewEndDom(
	token,
	{ winnerPlayerName, defeatedPlayerName, versusAi, isWinnerAi }
) {
	console.log(`${token} - ${winnerPlayerName} wins over ${defeatedPlayerName}`)
	removeDescendants(container)
	const gameEndViewDom = new GameEndViewDom(
		winnerPlayerName,
		defeatedPlayerName,
		versusAi,
		isWinnerAi
	)
	container.append(gameEndViewDom.div)
}
