import PlaceableObjectDom from "./PlaceableObjectDom"

export default class MissMarkDom extends PlaceableObjectDom {
	static blockName = "miss-mark"
	static zIndex = 2

	constructor(cellsCoords) {
		super([cellsCoords])
	}
}
