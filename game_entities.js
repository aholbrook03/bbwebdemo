const GameEntity = require('./entity').GameEntity
const SpriteComponent = require('./game_components').SpriteComponent

const BoulderBoy = {
  create: function() {
    const entity = GameEntity.create('Boulder Boy')
    const spriteComponent = SpriteComponent.create()
    
    return entity
  }
}

exports.BoulderBoy = BoulderBoy
