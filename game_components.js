const GameComponent = require('./entity').GameComponent
const Vector2 = require('./linalg').Vector2

const SpriteDirection = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3
}

const SpriteComponent = {
  create: function() {
    const component = GameComponent.create('SpriteComponent')
    component.position = Vector2.create()
    component.direction = SpriteDirection.LEFT
    component.animations = new Map()

    component.addAnimationFromTileSet = function(name, tileId, tileSet) {
    }

    component.useAnimation = function(name, loop) {
      loop = loop !== undefined ? loop : false
    }

    return component
  }
}

const PlayerComponent = {
  create: function() {
    const component = GameComponent.create('PlayerComponent')
    return component
  }
}

exports.SpriteComponent = SpriteComponent
