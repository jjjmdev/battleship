export function removeDescendants(element, newContent = undefined) {
	element.replaceChildren(newContent)
}
export function resetContent(contentDiv, newContent = undefined) {
	removeDescendants(contentDiv, newContent)
	contentDiv.setAttribute("class", "")
	window.scrollTo(0, 0)
}
