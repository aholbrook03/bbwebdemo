const StateMachine = {
  create: () => {
    let currentState = null

    return {
      getCurrentState: () => currentState,
      enterState: (state) => {
        if (currentState !== null) currentState.onExit()
        currentState = state
        currentState.onEnter()
      },
      update: (deltaTime) => { currentState.update(deltaTime) }
    }
  }
}

const State = {
  create: (enterCallback, exitCallback, updateCallback) => {
    return {
      onEnter: enterCallback,
      onExit: exitCallback,
      update: updateCallback
    }
  }
}

exports.StateMachine = StateMachine
exports.State = State
