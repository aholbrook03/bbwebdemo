const GameEntity = require('./entity').GameEntity
const SpriteComponent = require('./game_components').SpriteComponent
const ResourceMap = require('./resource').ResourceMap
const Vector2 = require('./linalg').Vector2

const BoulderBoy = {
  create: function() {
    const entity = GameEntity.create('Boulder Boy')
    const spriteComponent = SpriteComponent.create()

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
exports.ScrollingBackground = ScrollingBackground
exports.BlinkingLogo = BlinkingLogo
