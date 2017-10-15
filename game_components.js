const GameComponent = require('./entity').GameComponent

const SpriteComponent = {
  create: function() {
    const component = GameComponent.create()
    return component
  }
}

const PlayerComponent = {
  create: function() {
    const component = GameComponent.create()
    return component
  }
}

exports.SpriteComponent = SpriteComponent
