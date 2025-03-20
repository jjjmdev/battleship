function applyClass(element, className = null) {
	if (!className) return

	if (typeof className === "string") {
		element.classList.add(className)
	} else {
		element.classList.add(...className)
	}
}

export function initDiv(className = null) {
	const element = document.createElement("div")
	applyClass(element, className)
	return element
}

export function initHeader(className = null) {
	const element = document.createElement("header")
	applyClass(element, className)
	return element
}

export function initH1(className = null, text = "") {
	const element = document.createElement("h1")
	applyClass(element, className)
	element.textContent = text
	return element
}

export function initH2(className = null, text = "") {
	const element = document.createElement("h2")
	applyClass(element, className)
	element.textContent = text
	return element
}

export function initH3(className = null, text = "") {
	const element = document.createElement("h3")
	applyClass(element, className)
	element.textContent = text
	return element
}

export function initP(className = null, text = "") {
	const element = document.createElement("p")
	applyClass(element, className)
	element.textContent = text
	return element
}

export function initButton(
	className = null,
	clickCallback = () => {},
	type = "button",
	textContent
) {
	const element = document.createElement("button")
	applyClass(element, className)
	element.addEventListener("click", clickCallback)
	element.type = type
	element.textContent = textContent
	return element
}

export function initA(className = null, href = "", target = "_self") {
	const element = document.createElement("a")
	applyClass(element, className)
	element.href = href
	element.target = target
	return element
}

export function initImg(className = null, src = "", alt = "") {
	const element = document.createElement("img")
	applyClass(element, className)
	element.src = src
	element.alt = alt
	return element
}

export function initInput(
	className = null,
	id = "",
	name = "",
	placeholder = "",
	required = false,
	ariaLabel = "",
	type = "text"
) {
	const element = document.createElement("input")
	applyClass(element, className)

	element.id = id
	element.name = name
	element.placeholder = placeholder
	element.required = required
	element.ariaLabel = ariaLabel
	element.type = type

	return element
}

export function initTextArea(
	className = null,
	id = "",
	name = "",
	placeholder = "",
	required = false,
	ariaLabel = ""
) {
	const element = document.createElement("textarea")
	applyClass(element, className)

	element.id = id
	element.name = name
	element.placeholder = placeholder
	element.required = required
	element.ariaLabel = ariaLabel

	return element
}

export function initLabel(className = null, forAttribute = null) {
	const element = document.createElement("label")
	applyClass(element, className)

	element.setAttribute("for", forAttribute)

	return element
}

export function initSelect(className = null, id = "", name = "") {
	const element = document.createElement("select")
	applyClass(element, className)
	element.id = id
	element.name = name
	return element
}

export function initDataList(className = null, id = "") {
	const element = document.createElement("datalist")
	applyClass(element, className)
	element.id = id
	return element
}

export function initOption(
	className = null,
	value = "",
	label = "",
	textContent = ""
) {
	const element = document.createElement("option")
	applyClass(element, className)
	element.value = value
	element.label = label
	element.textContent = textContent
	return element
}

export function initOptionAsChildInList(
	parentList,
	className = null,
	value = "",
	label = "",
	textContent = ""
) {
	const element = initOption(className, value, label, textContent)
	parentList.appendChild(element)
	return element
}

export function initUl(className = null) {
	const element = document.createElement("ul")
	applyClass(element, className)
	return element
}

export function initOl(className = null) {
	const element = document.createElement("ol")
	applyClass(element, className)
	return element
}

export function initLi(className = null) {
	const element = document.createElement("li")
	applyClass(element, className)
	return element
}

export function initLiAsChildInList(parentList, className = null) {
	const element = initLi(className)
	parentList.appendChild(element)
	return element
}

export function initHr(className = null) {
	const element = document.createElement("hr")
	applyClass(element, className)
	return element
}

export function initSpan(className = null) {
	const element = document.createElement("span")
	applyClass(element, className)
	return element
}

export function initFooter(className = null) {
	const element = document.createElement("footer")
	applyClass(element, className)
	return element
}
