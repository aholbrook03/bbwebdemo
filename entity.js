const GameComponent = {
  create: function() {
    return {
      entity: null,
      update: function(deltaTime) {
      }
    }
  }
}

const GameEntity = {
  create: function(name) {
    components = []
    return {
      name: name,
      addComponent: function (c) {
        c.entity = this
        components.push(c)
      },
      getComponents: () => components
    }
  }
}

exports.GameComponent = GameComponent
exports.GameEntity = GameEntity
