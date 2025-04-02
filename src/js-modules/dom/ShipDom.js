import PlaceableObjectDom from "./PlaceableObjectDom.js"
import { initDiv } from "../utils/domComponents.js"
import { ships } from "../images.js"

export default class ShipDom extends PlaceableObjectDom {
	static blockName = "ship"
	static shadowBlockName = "shadow-ship"
	static zIndex = 2
	#maskDiv
	#name

	constructor(name, cellsCoords, direction) {
		super(cellsCoords)

		this.#name = name

		// Precompute mask (to be used when the ship will sunk, to add an overlay)
		this.#maskDiv = initDiv(`${this.constructor.blockName}__mask`)
		this.#maskDiv.style.display = "none"
		this.div.append(this.#maskDiv)

		this.#applyStyle(name, direction)
	}

	updatePosition(cellsCoords, direction) {
		super.updatePosition(cellsCoords)
		this.#applyStyle(this.#name, direction)
	}

	makeItSunk() {
		this.div.classList.add("sunk")
		this.#maskDiv.style.display = "block"
	}

	initShadowShipDiv() {
		const shadowShipDiv = this.div.cloneNode(true)
		shadowShipDiv.classList.remove(this.constructor.blockName)
		shadowShipDiv.classList.add(this.constructor.shadowBlockName)

		shadowShipDiv.style.zIndex = this.constructor.zIndex - 1

		return shadowShipDiv
	}

	#applyStyle(name, direction) {
		const imgDirection = direction == "N" || direction == "S" ? "S" : "E"

		const image = ships[name] ? ships[name][imgDirection] : null

		if (image) {
			this.div.style.backgroundImage = `url("${image}")`
			this.div.style.backgroundRepeat = "no-repeat"
			this.div.style.backgroundSize = "100% 100%"

			if (direction == "N" || direction == "W") {
				this.div.style.transform = "rotate(180deg)"
			} else {
				this.div.style.transform = "rotate(0)"
			}

			// Precompute mask style
			this.#maskDiv.style.maskImage = `url("${image}")`
			this.#maskDiv.style.maskRepeat = "no-repeat"
			this.#maskDiv.style.maskSize = "100%"
			this.#maskDiv.style.width = "100%"
			this.#maskDiv.style.height = "100%"
		} else {
			// Fallback styling
			this.div.style.background = "rgb(186, 168, 150)"
			this.div.style.background =
				"radial-gradient(closest-side, rgb(186, 168, 150) 0%, rgb(136, 117, 97) 50%, rgb(52, 43, 41) 100%)"

			const [r, R] = ["20px", "60%"]
			let borderRadius
			switch (direction) {
				case "S":
					borderRadius = `${r} ${r} ${R} ${R}`
					break
				case "N":
					borderRadius = `${R} ${R} ${r} ${r}`
					break
				case "E":
					borderRadius = `${r} ${R} ${R} ${r}`
					break
				case "W":
					borderRadius = `${R} ${r} ${r} ${R}`
					break
				default:
					borderRadius = r
					break
			}
		}
	}
}
