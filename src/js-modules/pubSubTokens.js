import PubSub from "pubsub-js"

export const pubSubTokens = {
	initGameView: "INIT GAME VIEW",
	gameViewInitialized: "GAME VIEW INITIALIZED",
	playTurn: "PLAY TURN",
	attackCoordsAcquired: "ATTACK COORDS ACQUIRED",
	attackOutcomeShown: "ATTACK OUTCOME SHOWN",
	playersSwitch: "PLAYERS SWITCH",
}

export const pubSubTopicUi = "ui"
export const pubSubTokensUi = {
	enableAimingOnGameboard: (player) =>
		`ui: ENABLE AIMING ON ${player.name} GAMEBOARD`,
	showAttackOutcome: (player) => `ui: SHOW ATTACK ON ${player.name} GAMEBOARD`,
	shipHasSunk: (player) => `ui: ${player.name} SHIP HAS SUNK`,
	toggleDeployedFleetShown: (player) =>
		`ui: TOGGLE DEPLOYED FLEET ON ${player.name} GAMEBOARD`,
}
