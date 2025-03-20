import PubSub from "pubsub-js"
import GameViewDom from "./dom/GameViewDom.js"
import GameEndViewDom from "./dom/GameEndViewDom.js"
import HomeViewDom from "./dom/HomeViewDom.js"
import PlayersNameViewDom from "./dom/PlayersNameViewDom.js"
import initMainFooter from "./initMainFooter.js"
import setCreditFooter from "./utils/creditFooter.js"
import { pubSubTokens } from "./pubSubTokens.js"
import { resetContent } from "./utils/domUtilities.js"

let container

export default function initWebpage() {
	container = document.createElement("main")
	const mainFooter = initMainFooter()
	document.body.append(container, mainFooter)

	setCreditFooter()

	PubSub.subscribe(pubSubTokens.showGameView, renderGameViewDom)
	PubSub.subscribe(pubSubTokens.showGameEndView, renderGameViewEndDom)
	PubSub.subscribe(pubSubTokens.showHomeView, renderHomeViewDom)
	PubSub.subscribe(pubSubTokens.showPlayersNameView, renderPlayersNameViewDom)

	renderHomeViewDom()
}

function renderGameViewDom(token, { player1, player2, versusAi }) {
	const gameViewDom = new GameViewDom(player1, player2, versusAi)
	resetContent(container, gameViewDom.div)
	// Notify the initialization of the page
	PubSub.publish(pubSubTokens.gameViewInitialized, renderGameViewDom)
}

function renderGameViewEndDom(
	token,
	{ winnerPlayerName, defeatedPlayerName, versusAi, isWinnerAi }
) {
	console.log(`${token} - ${winnerPlayerName} wins over ${defeatedPlayerName}`)
	const gameEndViewDom = new GameEndViewDom(
		winnerPlayerName,
		defeatedPlayerName,
		versusAi,
		isWinnerAi
	)
	resetContent(container, gameEndViewDom.div)
}

function renderHomeViewDom(token) {
	const homeViewDom = new HomeViewDom()
	resetContent(container, homeViewDom.div)
}

function renderPlayersNameViewDom(token, { versusAi }) {
	const playersNameViewDom = new PlayersNameViewDom(versusAi)
	resetContent(container, playersNameViewDom.div)
}
