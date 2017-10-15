const GamePresenter = {
  create: (canvas) => {
    let currentScene = { update: (deltaTime) => {}, render: (context) => {} }
    let context = canvas.getContext('2d')
    let scale = 1.0

    return {
      presentScene: function(nextScene) {
        nextScene.presenter = this
        nextScene.onPresent()
        currentScene = nextScene
      },
      getCurrentScene: () => currentScene,
      getCanvasSize: () => {
        return {
          width: canvas.width,
          height: canvas.height
        }
      },
      update: (deltaTime) => { currentScene.update(deltaTime) },
      render: () => { currentScene.render(context) }
    }
  }
}

const GameScene = {
  create: () => {
    return {
      presenter: null,
      onPresent: () => {},
      update: (deltaTime) => {},
      render: (context) => {}
    }
  }
}

exports.GamePresenter = GamePresenter
exports.GameScene = GameScene
