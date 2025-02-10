import "./styles.css"
import Player from "./js-modules/logic/Player.js"
import GameViewDom from "./js-modules/dom/GameViewDom.js"

const player = new Player("Captain X")
player.randomShipsPlacement()

const player2 = new Player("Captain Y")
player2.randomShipsPlacement()

player.gameboard.receiveAttack([0, 0])
player.gameboard.receiveAttack([3, 0])
player.gameboard.receiveAttack([2, 3])
player.gameboard.receiveAttack([7, 5])
player.gameboard.receiveAttack([6, 1])

const gameViewDom = new GameViewDom(player, player2)
document.body.append(gameViewDom.div)
