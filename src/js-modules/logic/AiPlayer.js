import Player from "./Player.js"

export default class AiPlayer extends Player {
	constructor(
		name,
		fleet = Player.defaultFleet,
		nCols = Player.defaultGameboardSize,
		nRows = nCols
	) {
		super(name, fleet, nCols, nRows)
	}
}
