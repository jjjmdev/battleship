export default class Ship {
	#length
	#hits
	#name

	constructor(length, name = "") {
		this.#length = length
		this.#hits = 0
		this.#name = name
	}

	get length() {
		return this.#length
	}

	get name() {
		return this.#name
	}

	get hits() {
		return this.#hits
	}

	hit() {
		if (this.isSunk()) {
			throw new Error("The ship is already sunk")
		}

		this.#hits += 1
	}

	isSunk() {
		return this.#hits === this.#length
	}
}
