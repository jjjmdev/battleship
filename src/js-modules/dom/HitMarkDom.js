import PlaceableObjectDom from "./PlaceableObjectDom"

export default class HitMarkDom extends PlaceableObjectDom {
	static blockName = "hit-mark"
	static zIndex = 3

	constructor(cellsCoords) {
		super([cellsCoords])
	}
}
