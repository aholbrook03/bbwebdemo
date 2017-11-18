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
    const component = GameComponent.create('Sprite')
    component.direction = SpriteDirection.LEFT

    component.addAnimationFromTileSet = function(name, tileId, tileSet) {
      animations.set(name, {
        frames: tileSet.getTileAnimationInfo(tileId),
        currentFrameIndex: 0,
        elapsedTime: 0
      })
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

const AimDirection = {
  FACING: 0,
  MULTIPLE: 1
}

const AimAndShootComponent = {
  create: function(tileSet) {
    const component = GameComponent.create('AimAndShoot')

    component.setTarget = function(target) { this.target = target }
    component.setAimDirection = function(aimDirection) {
      this.aimDirection = aimDirection
    }

    component.setProjectileEntity = function(projectileEntity) {
      this.projectileEntity = projectileEntity
    }

    component.shoot = function(directionVector) {
      if (this.projectileList.length >= this.maxProjectiles) return
      if (this.shouldFreezeTarget) this.freezeTarget()
      const projectile = this.projectileEntity.create(tileSet)
      projectile.position = this.entity.position.copy()
      projectile.velocity = directionVector.setLength(this.projectileSpeed)
      this.projectileList.push(projectile)
    }

    component.freezeTarget = function() {
      this.target.stopMoving()
      this.target.state = 'frozen'
    }

    component.update = function(deltaTime) {
      if (this.target !== undefined) {
        const column = Math.floor(this.entity.position.x + tileSize.width / 2) >> 3
        const row = Math.floor(this.entity.position.y + tileSize.height / 2) >> 3
        const targetColumn = Math.floor(this.target.position.x + tileSize.width / 2) >> 3
        const targetRow = Math.floor(this.target.position.y + tileSize.height / 2) >> 3

        if (this.aimDirection === AimDirection.FACING) {
          const spriteDirection = this.entity.getComponent('Sprite').direction
          if (spriteDirection === SpriteDirection.UP) {
            if (targetColumn === column) {
              if (targetRow <= row) {
                this.shoot(Vector2.create(0, -1))
              }
            }
          } else if (spriteDirection === SpriteDirection.DOWN) {
            if (targetColumn === column) {
              if (targetRow >= row) {
                this.shoot(Vector2.create(0, 1))
              }
            }
          } else if (spriteDirection === SpriteDirection.LEFT) {
            if (targetRow === row) {
              if (targetColumn <= column) {
                this.shoot(Vector2.create(-1, 0))
              }
            }
          } else if (spriteDirection === SpriteDirection.RIGHT) {
            if (targetRow === row) {
              if (targetColumn >= column) {
                this.shoot(Vector2.create(1, 0))
              }
            }
          }
        }
      }

      for (const projectile of this.projectileList) projectile.update(deltaTime)
    }

    component.projectileList = []
    component.maxProjectiles = 1
    component.shouldFreezeTarget = true
    component.projectileSpeed = 0
    const tileSize = { width: 8, height: 8 }

    return component
  }
}

exports.SpriteDirection = SpriteDirection
exports.SpriteComponent = SpriteComponent
exports.AimAndShootComponent = AimAndShootComponent
exports.AimDirection = AimDirection
