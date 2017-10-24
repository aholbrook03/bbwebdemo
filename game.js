const view = require('./view')
const LoadingScene = require('./game_scenes').LoadingScene
const LogoScene = require('./game_scenes').LogoScene
const FadeTransitionScene = require('./game_scenes').FadeTransitionScene
const ResourceMap = require('./resource').ResourceMap
const Vector2 = require('./linalg').Vector2
const GameConfig = require('./config').GameConfig

const game = {
  init: function(canvas) {
    GameConfig.init()
    this.presenter = view.GamePresenter.create(canvas)
    this.startTime = null

    this.presenter.presentScene(LoadingScene.create())

    // load all required assets (images/sounds/etc)
    ResourceMap.init().then(() => {
      // setup scenes
      this.presenter.presentScene(FadeTransitionScene.create(LogoScene.create(),
        3000))
    })
  },
  update: function(currentTime) {
    if (this.startTime === null) this.startTime = currentTime
    const deltaTime = currentTime - this.startTime
    this.startTime = currentTime

    this.presenter.update(deltaTime)
    this.presenter.render()
  }
}

module.exports = game
