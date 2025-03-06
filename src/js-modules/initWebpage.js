import GameViewDom from "./dom/GameViewDom.js"
import GameEndViewDom from "./dom/GameEndViewDom.js"
import HomeViewDom from "./dom/HomeViewDom.js"
import PlayersNameViewDom from "./dom/PlayersNameViewDom.js"
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
	PubSub.subscribe(pubSubTokens.showHomeView, renderHomeViewDom)
	PubSub.subscribe(pubSubTokens.showPlayersNameView, renderPlayersNameViewDom)

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

function renderHomeViewDom(token) {
	console.log(token)
	removeDescendants(container)
	const homeViewDom = new HomeViewDom()
	container.append(homeViewDom.div)
}

function renderPlayersNameViewDom(token, { versusAi }) {
	console.log(token)
	removeDescendants(container)
	const playersNameViewDom = new PlayersNameViewDom(versusAi)
	container.append(playersNameViewDom.div)
}
