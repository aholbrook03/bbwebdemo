const State = require('./state').State

const LoadingState = {
  create: () => {
    function enterCallback() {
    }

    function exitCallback() {
    }

    function updateCallback(deltaTime) {
    }

    const state = State.create(enterCallback, exitCallback,
      updateCallback)
    return state
  }
}

exports.LoadingState = LoadingState
