import "./styles.css"
import Player from "./js-modules/logic/Player"
import PlayerDom from "./js-modules/dom/PlayerDom"

const player = new Player("Captain X")
player.randomShipsPlacement()
player.gameboard.receiveAttack([0, 0])

const playerDom = new PlayerDom(player)
document.body.append(playerDom.div)
