import { initDiv } from "../utils/domComponents"
import { pubSubTokens } from "../pubSubTokens"
import PubSub from "pubsub-js"

const blockName = "deploy-fleet"
const cssClass = {}
const getCssClass = (element) => `${blockName}__${cssClass[element]}`

export default class DeployFleetViewDom {
	#div

	constructor(player, isAi) {
		player.randomShipsPlacement()

		console.log(`${player.name}${isAi ? "(AI)" : ""} has deployed its fleet.`)

		// todo
		this.#div = this.#initDeployFleetViewDiv()

		// Notify the initialization of the page
		PubSub.publish(pubSubTokens.fleetDeployed)
	}

	// Getters
	get div() {
		return this.#div
	}

	#initDeployFleetViewDiv() {
		const div = initDiv(blockName)
		// todo

		return div
	}
}
