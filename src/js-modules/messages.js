const home = [
	"BATTLESHIP",
	"Fair winds and following seas! Until next battle...",
]

const editInstructions =
	"Click/tap on a ship to rotate it. Drag and drop to move it."

const gameEnd = {
	win1: ["VICTORY!", "Your fleet sails victorious across the seven seas!"],
	defeat1: ["GAME OVER!", "Your fleet has been reclaimed by the sea..."],
	win2: (winnerPlayerName, defeatPlayerName) => [
		`Well done, ${winnerPlayerName}!`,
		`All ${defeatPlayerName}'s ships are lost to the depths.`,
	],
}

export function getEditInstructionsMessage() {
	return editInstructions
}

export function getGameEndMessage(
	winnerPlayerName,
	defeatedPlayerName,
	versusAi,
	isWinnerAi
) {
	if (versusAi) {
		if (isWinnerAi) {
			return gameEnd.defeat1
		} else {
			return gameEnd.win1
		}
	} else {
		return gameEnd.win2(winnerPlayerName, defeatedPlayerName)
	}
}

export function getHomeViewMessage() {
	return home
}
