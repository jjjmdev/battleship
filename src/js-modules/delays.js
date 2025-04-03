// The duration of the animations in the gameboard (eg., placing a ship, adding a hit/miss mark,)
// rotating a ship, or moving it)
export const animationDuration = 200 // ms

// A small delay used to wait for the Dom to be updated
export const waitDomDelay = 60 // ms, just to ensure the dom is updated

// The artificial waiting in which the AI opponent deploys it fleet
// eg., you might want to show a message in the UI
export const aiDeployFleetDelay = 2000 // ms

// The artificial waiting in which the AI opponent makes an attack
// eg., you might want to use this to make it appear as if the AI is thinking of the next move to do
export const aiMoveDelay = 500 // ms

// The artificial waiting time between the last move and the showing of the end game view
// eg., you might want to show a message in the UI
export const endGameDelay = 2000 // ms
