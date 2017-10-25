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
    component.direction = SpriteDirection.LEFT

    component.addAnimationFromTileSet = function(name, tileId, tileSet) {
      animations.set(name, {
        frames: tileSet.getTileAnimationInfo(tileId),
        currentFrameIndex: 0,
        elapsedTime: 0
      })
      console.log(animations)
    }

    component.useAnimation = function(name, endCallback) {
      const animation = animations.get(name)
      animation.elapsedTime = 0
      animation.currentFrameIndex = 0

      currentAnimation = name
      if (endCallback !== undefined) callback = endCallback
    }

    component.getCurrentFrameTileId = function() {
      const animation = animations.get(currentAnimation)
      const frames = animation.frames
      const currentFrameIndex = animation.currentFrameIndex
      return frames[currentFrameIndex].tileid
    }

    component.getCurrentAnimation = () => currentAnimation

    component.update = function(deltaTime) {
      const animation = animations.get(currentAnimation)
      const frames = animation.frames
      const currentFrame = frames[animation.currentFrameIndex]
      animation.elapsedTime += deltaTime
      while (animation.elapsedTime >= currentFrame.duration) {
        animation.elapsedTime -= currentFrame.duration
        animation.currentFrameIndex++
        if (animation.currentFrameIndex === frames.length) {
          animation.currentFrameIndex = 0
          callback()
        }
      }
    }

    const animations = new Map()
    let currentAnimation = 'idle'
    let callback = () => {}

    return component
  }
}

exports.SpriteDirection = SpriteDirection
exports.SpriteComponent = SpriteComponent
