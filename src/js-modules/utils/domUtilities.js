export function removeDescendants(element) {
	while (element.hasChildNodes()) {
		removeDescendants(element.lastChild)
		element.removeChild(element.lastChild)
	}
}
