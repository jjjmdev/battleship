import GameViewDom from "./dom/GameViewDom.js"
import GameController from "./logic/GameController.js"
import PubSub from "pubsub-js"
import { pubSubTokens } from "./pubSubTokens.js"

export default function initWebpage() {
	const player1Name = "Captain X"
	const player2Name = "Captain Y"
	const versusAi = true

	PubSub.subscribe(pubSubTokens.initGameView, renderGameViewDom)

	const gameController = new GameController(player1Name, player2Name, versusAi)
}

function renderGameViewDom(token, { player1, player2 }) {
	console.log(`${token} - ${player1.name} vs ${player2.name}`)
	const gameViewDom = new GameViewDom(player1, player2)
	document.body.append(gameViewDom.div)
}
