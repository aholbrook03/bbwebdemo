const GameComponent = {
  create: function(componentName) {
    return {
      name: componentName,
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
      getComponents: () => components,
      getComponent: (name) => {
        for (const c of components) if (c.name === name) return c
      },
      update: function(deltaTime) {
        for (const c of components) c.update(deltaTime)
      }
    }
  }
}

exports.GameComponent = GameComponent
exports.GameEntity = GameEntity
