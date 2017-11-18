const GameEntity = require('./entity').GameEntity
const SpriteDirection = require('./game_components').SpriteDirection
const SpriteComponent = require('./game_components').SpriteComponent
const AimAndShootComponent = require('./game_components').AimAndShootComponent
const AimDirection = require('./game_components').AimDirection
const ResourceMap = require('./resource').ResourceMap
const Vector2 = require('./linalg').Vector2
const GameConfig = require('./config').GameConfig

const BoulderBoy = {
  create: function(tileSet) {
    const entity = GameEntity.create('Boulder Boy')
    entity.state = 'idle'

    const spriteComponent = SpriteComponent.create()
    spriteComponent.direction = SpriteDirection.RIGHT
    for (const v in GameConfig.boulderBoyIds) {
      spriteComponent.addAnimationFromTileSet(v, GameConfig.boulderBoyIds[v],
        tileSet)
    }

    entity.addComponent(spriteComponent)

    entity.setDirection = function(direction) {
      spriteComponent.direction = direction
    }

    entity.rollLeft = function() {
      this.velocity.x = -GameConfig.boulderBoySpeed
      this.velocity.y = 0
      spriteComponent.useAnimation('roll')
      spriteComponent.direction = SpriteDirection.LEFT
    }

    entity.rollRight = function() {
      this.velocity.x = GameConfig.boulderBoySpeed
      this.velocity.y = 0
      spriteComponent.useAnimation('roll')
      spriteComponent.direction = SpriteDirection.RIGHT
    }

    entity.rollUp = function() {
      this.velocity.x = 0
      this.velocity.y = -GameConfig.boulderBoySpeed
      spriteComponent.useAnimation('rollUp')
    }

    entity.rollDown = function() {
      this.velocity.x = 0
      this.velocity.y = GameConfig.boulderBoySpeed
      spriteComponent.useAnimation('rollDown')
    }

    entity.stopMoving = function() {
      this.velocity.x = 0
      this.velocity.y = 0
      spriteComponent.useAnimation('idle')
    }

    entity.render = function(context) {
      let x = Math.floor(this.position.x)
      let y = Math.floor(this.position.y)
      const tileId = spriteComponent.getCurrentFrameTileId()

      if (spriteComponent.direction !== SpriteDirection.RIGHT) {
        x += tileSet.getTileSize().width
        context.translate(x * this.scale, y * this.scale)
        context.scale(-this.scale, this.scale)
      } else {
        context.translate(x * this.scale, y * this.scale)
        context.scale(this.scale, this.scale)
      }

      tileSet.drawTile(tileId, 0, 0, context)
      context.setTransform(1, 0, 0, 1, 0, 0)
    }

    return entity
  }
}

const Snake = {
  create: function(tileSet) {
    const entity = GameEntity.create('Snake')
    entity.state = 'idle'

    const spriteComponent = SpriteComponent.create()
    spriteComponent.direction = SpriteDirection.LEFT
    for (const v in GameConfig.snakeIds) {
      spriteComponent.addAnimationFromTileSet(v, GameConfig.snakeIds[v],
        tileSet)
    }

    entity.addComponent(spriteComponent)

    entity.setDirection = function(direction) {
      spriteComponent.direction = direction
    }

    entity.render = function(context) {
      let x = Math.floor(this.position.x)
      let y = Math.floor(this.position.y)
      const tileId = spriteComponent.getCurrentFrameTileId()

      if (spriteComponent.direction !== SpriteDirection.LEFT) {
        x += tileSet.getTileSize().width
        context.translate(x * this.scale, y * this.scale)
        context.scale(-this.scale, this.scale)
      } else {
        context.translate(x * this.scale, y * this.scale)
        context.scale(this.scale, this.scale)
      }

      tileSet.drawTile(tileId, 0, 0, context)
      context.setTransform(1, 0, 0, 1, 0, 0)
    }

    return entity
  }
}

const Squirrel = {
  create: function(tileSet) {
    const entity = GameEntity.create('Squirrel')
    entity.state = 'idle'

    const spriteComponent = SpriteComponent.create()
    spriteComponent.direction = SpriteDirection.LEFT
    for (const v in GameConfig.squirrelIds) {
      spriteComponent.addAnimationFromTileSet(v, GameConfig.squirrelIds[v],
        tileSet)
    }

    entity.addComponent(spriteComponent)

    const aimAndShootComponent = AimAndShootComponent.create(tileSet)
    aimAndShootComponent.setAimDirection(AimDirection.FACING)
    aimAndShootComponent.setProjectileEntity(Acorn)
    aimAndShootComponent.shouldFreezeTarget = false
    aimAndShootComponent.projectileSpeed = GameConfig.squirrelProjectileSpeed
    entity.addComponent(aimAndShootComponent)

    entity.setDirection = function(direction) {
      spriteComponent.direction = direction
      if (direction === SpriteDirection.UP) {
        spriteComponent.useAnimation('up')
      } else if (direction === SpriteDirection.DOWN) {
        spriteComponent.useAnimation('down')
      }
    }

    entity.superUpdate = entity.update
    entity.update = function(deltaTime) {
      this.superUpdate(deltaTime)
      for (const projectile of aimAndShootComponent.projectileList) {
        projectile.update(deltaTime)
      }
    }

    entity.render = function(context) {
      let x = Math.floor(this.position.x)
      let y = Math.floor(this.position.y)
      const tileId = spriteComponent.getCurrentFrameTileId()

      if (spriteComponent.direction === SpriteDirection.RIGHT) {
        x += tileSet.getTileSize().width
        context.translate(x * this.scale, y * this.scale)
        context.scale(-this.scale, this.scale)
      } else {
        context.translate(x * this.scale, y * this.scale)
        context.scale(this.scale, this.scale)
      }

      tileSet.drawTile(tileId, 0, 0, context)
      context.setTransform(1, 0, 0, 1, 0, 0)

      for (const projectile of aimAndShootComponent.projectileList) {
        projectile.render(context)
      }
    }

    return entity
  }
}

const Acorn = {
  create: function(tileSet) {
    const entity = GameEntity.create('Acorn')

    const spriteComponent = SpriteComponent.create()
    spriteComponent.direction = SpriteDirection.LEFT

    for (const v in GameConfig.acornIds) {
      spriteComponent.addAnimationFromTileSet(v, GameConfig.acornIds[v],
        tileSet)
    }

    entity.addComponent(spriteComponent)

    entity.render = function(context) {
      let x = Math.floor(this.position.x)
      let y = Math.floor(this.position.y)
      const tileId = spriteComponent.getCurrentFrameTileId()

      context.translate(x * this.scale, y * this.scale)
      context.scale(this.scale, this.scale)
      tileSet.drawTile(tileId, 0, 0, context)
      context.setTransform(1, 0, 0, 1, 0, 0)
    }

    return entity
  }
}

const ScrollingBackground = {
  create: (image, imageScale, scrollVector, backgroundSize) => {
    return {
      render: (context) => {
      }
    }
  }
}

const BlinkingLogo = {
  create: function() {
    const logoFrames = [
      ResourceMap.get('logo1.png'), // eyes closed
      ResourceMap.get('logo2.png'), // eyes partially closed
      ResourceMap.get('logo3.png')  // eyes open
    ]

    const IDLE = 0
    const OPENING_EYES = 1
    const CLOSING_EYES = 2
    let state = IDLE
    let currentFrame = logoFrames.length - 1 // start with open eyes

    let elapsedTime = 0
    let blinkCount = 0
    const blinkingStartDelay = 1000
    const doubleBlinkDelay = 0
    const blinkDelayPerFrame = 50

    return {
      update: function(deltaTime) {
        elapsedTime += deltaTime
        if (state === IDLE) {
          if (blinkCount < 2) {
            if (elapsedTime >= blinkingStartDelay) {
              elapsedTime = 0
              state = CLOSING_EYES
            }
          } else {
            if (elapsedTime >= doubleBlinkDelay) {
              elapsedTime = 0
              state = CLOSING_EYES
            }
          }
        } else {
          while (elapsedTime >= blinkDelayPerFrame) {
            elapsedTime -= blinkDelayPerFrame
            if (state === CLOSING_EYES) {
              currentFrame--
              if (currentFrame <= 0) {
                currentFrame = 0
                state = OPENING_EYES
              }
            } else if (state === OPENING_EYES) {
              currentFrame++
              if (currentFrame >= logoFrames.length - 1) {
                currentFrame = logoFrames.length - 1
                blinkCount++
                if (blinkCount === 3) blinkCount = 0
                state = IDLE
              }
            }
          }
        }
      },
      render: function(x, y, scale, context) {
        const logoWidth = logoFrames[currentFrame].width * scale
        const logoHeight = logoFrames[currentFrame].height * scale
        context.drawImage(logoFrames[currentFrame],
          x - logoWidth / 2, y - logoHeight / 2,
          logoWidth, logoHeight)
      }
    }
  }
}

exports.BoulderBoy = BoulderBoy
exports.Snake = Snake
exports.Squirrel = Squirrel
exports.ScrollingBackground = ScrollingBackground
exports.BlinkingLogo = BlinkingLogo
