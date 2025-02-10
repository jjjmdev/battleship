import { initHeader, initH1 } from "../utils/domComponents.js"

const blockName = "header"
const cssClass = {
	h1: "h1",
}

const getCssClass = (element) => `${blockName}__${cssClass[element]}`

export default function initMainHeader() {
	const header = initHeader(blockName)
	const h1 = initH1(getCssClass("h1"), "BATTLESHIP")
	header.append(h1)
	return header
}
