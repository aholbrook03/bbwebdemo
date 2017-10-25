const Vector2 = require('./linalg').Vector2

const GameComponent = {
  create: function(componentName) {
    return {
      name: componentName,
      entity: null,
      update: function(deltaTime) {}
    }
  }
}

const GameEntity = {
  create: function(name) {
    const components = []

    return {
      name: name,
      position: Vector2.create(),
      velocity: Vector2.create(),
      scale: 1.0,
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
        this.position.add(this.velocity.copy().mul(deltaTime))
      }
    }
  }
}

exports.GameComponent = GameComponent
exports.GameEntity = GameEntity
