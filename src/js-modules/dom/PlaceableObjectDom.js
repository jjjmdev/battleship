import { initDiv } from "../utils/domComponents.js"

export default class PlaceableObjectDom {
	#div
	static blockName = "placeable-object"
	static zIndex = 0

	constructor(cellsCoords) {
		this.#div = this.#initObjectDiv(cellsCoords)
		this.#div.obj = this
	}

	get div() {
		return this.#div
	}

	#initObjectDiv(cellsCoords) {
		const div = initDiv(this.constructor.blockName)
		this.#setGridLocation(div, cellsCoords)
		return div
	}

	#setGridLocation(div, cellsCoords) {
		const minCol = cellsCoords.reduce(
			(min, item) => (item[0] < min ? item[0] : min),
			cellsCoords[0][0]
		)

		const minRow = cellsCoords.reduce(
			(min, item) => (item[1] < min ? item[1] : min),
			cellsCoords[0][1]
		)

		const maxCol = cellsCoords.reduce(
			(max, item) => (item[0] > max ? item[0] : max),
			cellsCoords[0][0]
		)

		const maxRow = cellsCoords.reduce(
			(max, item) => (item[1] > max ? item[1] : max),
			cellsCoords[0][1]
		)

		// console.log(minCol, maxCol, minRow, maxRow)

		div.style.gridColumn = `${minCol + 1} / ${maxCol + 2}`
		div.style.gridRow = `${minRow + 1} / ${maxRow + 2}`
		div.style.width = "100%"
		div.style.height = "100%"
		div.style.zIndex = this.constructor.zIndex
		div.style.aspectRatio = `${maxCol - minCol + 1} / ${maxRow - minRow + 1}`
	}

	updatePosition(cellsCoords) {
		this.#setGridLocation(this.#div, cellsCoords)
	}
}
