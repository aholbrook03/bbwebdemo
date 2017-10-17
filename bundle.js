require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const GameConfig = {
  TILESET_SOURCE: 'tileset.json',
  STAGE_LIST: (() => {
    const tmpList = []
    for (let i = 0; i < 10; ++i) tmpList.push('1-' + i + '.json')
    return tmpList
  })(),
  RESOURCE_LIST: ['world_01_loop.wav', 'tileset.png', 'logo0.png', 'logo1.png',
    'logo2.png', 'logo3.png', 'tileset.json', 'Trailer_Theme_Ver1.mp3']
}

exports.GameConfig = GameConfig

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./entity":2}],4:[function(require,module,exports){
const GameEntity = require('./entity').GameEntity
const SpriteComponent = require('./game_components').SpriteComponent
const ResourceMap = require('./resource').ResourceMap

const BoulderBoy = {
  create: function() {
    const entity = GameEntity.create('Boulder Boy')
    const spriteComponent = SpriteComponent.create()

    return entity
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
      render: function(context, x, y, scale) {
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
exports.BlinkingLogo = BlinkingLogo

},{"./entity":2,"./game_components":3,"./resource":7}],5:[function(require,module,exports){
const view = require('./view')
const ResourceMap = require('./resource').ResourceMap
const TileSet = require('./tilemap').TileSet
const VerticalTileStrip = require('./tilemap').VerticalTileStrip
const BlinkingLogo = require('./game_entities').BlinkingLogo

const StageScene = {
  create: () => {
    const scene = view.GameScene.create()
    return scene
  }
}

const LogoScene = {
  create: () => {
    const tileSet = TileSet.createFromJSON(ResourceMap.get('tileset.json'))

    let tileStrip = VerticalTileStrip.create(tileSet,
      [4, 4, 4, 4, 102, 101, 101, 193, 2, 2, 2, 129, 3, 3, 3, 3, 132, 704, 704,
        704, 704])
    let scrollingOffsetX = 0
    const deltaOffsetX = 375.0 / 15000.0

    const blinkingLogo = BlinkingLogo.create()
    let displayText = false
    const scene = view.GameScene.create()

    scene.onPresent = () => { ResourceMap.get('Trailer_Theme_Ver1.mp3').play() }
    scene.onMouseDown = function(button, position) {
      const canvasSize = this.presenter.getCanvasSize()
      console.log(position)
      if (position.x < canvasSize.width && position.y < canvasSize.height) {
        ResourceMap.get('Trailer_Theme_Ver1.mp3').stop()
        this.presenter.presentScene(StageScene.create())
      }
    }

    scene.update = function(deltaTime) {
      displayText = true

      scrollingOffsetX -= deltaOffsetX * deltaTime
      if (scrollingOffsetX <= -tileSet.getTileSize().width) {
        scrollingOffsetX = 0
      }

      tileStrip.update(deltaTime)
      blinkingLogo.update(deltaTime)
    }

    scene.render = function(context) {
      const canvasSize = this.presenter.getCanvasSize()

      context.fillStyle = 'rgb(0, 0, 0)'
      context.fillRect(0, 0, canvasSize.width, canvasSize.height)

      context.scale(2, 2)
      for (let i = 0; i < 13; ++i)
        tileStrip.render(i * 16 + Math.floor(scrollingOffsetX), 0, context)
      context.setTransform(1, 0, 0, 1, 0, 0)

      blinkingLogo.render(context,
        canvasSize.width / 2, canvasSize.height / 2,
        0.5)

      if (displayText) {
        const text = 'TAP/CLICK TO START'
        context.fillStyle = 'rgb(0, 0, 0)'
        context.font = "32px retro";

        const x = canvasSize.width / 2 - context.measureText(text).width / 2
        const y = canvasSize.height * 3 / 4
        context.fillText(text, x, y)
      }
    }

    return scene
  }
}

const LoadingScene = {
  create: () => {
    const scene = view.GameScene.create()
    const minScale = 1.0
    const maxScale = 2.0
    let curScale = minScale
    const dScale = 1.0 / 500
    let scaleUp = true

    scene.update = function(deltaTime) {
      if (scaleUp) {
        curScale += dScale * deltaTime
        if (curScale >= maxScale) {
          curScale = maxScale
          scaleUp = false
        }
      } else {
        curScale -= dScale * deltaTime
        if (curScale <= minScale) {
          curScale = minScale
          scaleUp = true
        }
      }
    }

    scene.render = function(context) {
      const canvasSize = this.presenter.getCanvasSize()
      context.clearRect(0, 0, canvasSize.width, canvasSize.height)
      const text = "LOADING"
      context.fillStyle = 'rgb(0, 0, 0)'
      context.font = "32px retro";

      const x = (canvasSize.width / curScale) / 2 - context.measureText(text).width / 2
      const y = (canvasSize.height / curScale) / 2
      context.scale(curScale, curScale)
      context.fillText(text, x, y)
      context.setTransform(1, 0, 0, 1, 0, 0)
    }

    return scene
  }
}

const FadeTransitionScene = {
  create: (newScene, duration) => {
    let oldSceneSnapshot = null
    let newSceneSnapshot = null
    let elapsedTime = 0
    const halfDuration = duration / 2

    const scene = view.GameScene.create()
    scene.onPresent = function() {
      const canvasSize = this.presenter.getCanvasSize()
      oldSceneSnapshot = document.createElement('canvas')
      oldSceneSnapshot.width = canvasSize.width
      oldSceneSnapshot.height = canvasSize.height

      const oldScene = this.presenter.getCurrentScene()
      let context = oldSceneSnapshot.getContext('2d')
      context.imageSmoothingEnabled = false
      oldScene.render(context)

      newSceneSnapshot = document.createElement('canvas')
      newSceneSnapshot.width = canvasSize.width
      newSceneSnapshot.height = canvasSize.height

      newScene.presenter = this.presenter
      context = newSceneSnapshot.getContext('2d')
      context.imageSmoothingEnabled = false
      newScene.render(context)
    }

    scene.update = function(deltaTime) {
      elapsedTime += deltaTime
      if (elapsedTime >= halfDuration) newScene.update(deltaTime)
      if (elapsedTime >= duration) this.presenter.presentScene(newScene)
    }

    scene.render = function(context) {
      const canvasSize = this.presenter.getCanvasSize()
      context.clearRect(0, 0, canvasSize.width, canvasSize.height)
      if (elapsedTime < halfDuration) {
        context.drawImage(oldSceneSnapshot, 0, 0)
        const alpha = Math.min(elapsedTime / halfDuration, 1.0)
        context.fillStyle = 'rgba(0, 0, 0, ' + alpha.toString() + ')'
        context.fillRect(0, 0, oldSceneSnapshot.width, oldSceneSnapshot.height)
      } else {
        context.drawImage(newSceneSnapshot, 0, 0)
        const alpha = 2.0 - Math.min(elapsedTime / halfDuration, 2.0)
        context.fillStyle = 'rgba(0, 0, 0, ' + alpha.toString() + ')'
        context.fillRect(0, 0, newSceneSnapshot.width, newSceneSnapshot.height)
      }
    }

    return scene
  }
}

exports.StageScene = StageScene
exports.LogoScene = LogoScene
exports.LoadingScene = LoadingScene
exports.FadeTransitionScene = FadeTransitionScene

},{"./game_entities":4,"./resource":7,"./tilemap":8,"./view":9}],6:[function(require,module,exports){
const Vector2 = {
  create: (x, y) => {
    return {
      x: x,
      y: y,
      copy: function() { return Vector2.create(this.x, this.y) },
      length: function() { return Math.sqrt(this.length2()) },
      length2: function() { return this.dot(this) },
      normalize: function() {
        const invlen = 1.0 / this.length()
        this.x *= invlen
        this.y *= invlen

        return this
      },
      getNormalized: function() { return this.copy().normalize() },
      add: function(other) {
        if (typeof other === 'number') {
          this.x += other
          this.y += other
        } else {
          this.x += other.x
          this.y += other.y
        }
      },
      sub: function(other) {
        if (typeof other === 'number') {
          this.x -= other
          this.y -= other
        } else {
          this.x -= other.x
          this.y -= other.y
        }
      },
      mul: function(scalar) {
        this.x *= scalar
        this.y *= scalar
      },
      div: function(scalar) {
        this.x /= scalar
        this.y /= scalar
      },
      dot: function(otherVector) {
        return this.x * otherVector.x + this.y * otherVector.y
      }
    }
  }
}

exports.Vector2 = Vector2

},{}],7:[function(require,module,exports){
const GameConfig = require('./config').GameConfig

const ResourceMap = {
  resources: new Map(),
  init: function() {
    const resourcesRef = this.resources
    const isImage = (s) => s.match(/\.png/i) !== null
    const isAudio = (s) => s.match(/\.wav/i) !== null || s.match(/\.mp3/i) !== null
    const isJSON = (s) => s.match(/\.json/i) !== null
    const promiseList = []
    for (const resource of GameConfig.RESOURCE_LIST) {
      if (isImage(resource)) {
        promiseList.push((new Promise((resolve) => {
          const image = new Image()
          image.onload = (status) => { resolve(image) }
          image.src = resource
        })).then((image) => { resourcesRef.set(resource, image) }))
      } else if (isAudio(resource)) {
        promiseList.push((new Promise((resolve) => {
          const audio = new Audio()
          audio.onloadeddata = (status) => { resolve(audio) }
          audio.src = resource
        })).then((audio) => {
          audio.stop = function() { this.pause(); this.currentTime = 0 }
          resourcesRef.set(resource, audio)
        }))
      } else if (isJSON(resource)) {
        promiseList.push((new Promise((resolve) => {
          $.get(resource).then((data) => {
            if (typeof data === 'string') resolve(JSON.parse(data))
            else resolve(data)
          })
        })).then((data) => { resourcesRef.set(resource, data) }))
      }
    }

    return Promise.all(promiseList)
  },
  get: function(name) { return this.resources.get(name) }
}

exports.ResourceMap = ResourceMap

},{"./config":1}],8:[function(require,module,exports){
const ResourceMap = require('./resource').ResourceMap

const TileSet = {
  createFromJSON: function(json) {
    const image = ResourceMap.get(json.image)
    const tileSet = this.createFromImage(image, json.tilewidth, json.tileheight)

    const tileProperties = []
    for (let i = 0; i < json.tilecount; ++i) {
      tileProperties.push({
        solid: false,
        path: false,
        water: false,
        hazard: false
      })
    }

    for (let tileId in json.tileproperties)
      for (let prop in json.tileproperties[tileId])
        tileProperties[tileId][prop] = json.tileproperties[tileId][prop]

    tileSet.getTileProperties = (tileId) => tileProperties[tileId]

    const tileAnimationInfo = {}
    for (let tileId in json.tiles)
      tileAnimationInfo[tileId] = json.tiles[tileId]['animation']

    tileSet.getTileAnimationInfo = (tileId) => tileAnimationInfo[tileId]

    return tileSet
  },
  createFromImage: function(image, tileWidth, tileHeight) {
    tileWidth = tileWidth === undefined ? 16 : tileWidth
    tileHeight = tileHeight === undefined ? 16 : tileHeight
    numColumns = Math.floor(image.width / tileWidth)

    return {
      getTileSize: () => {
        return {width: tileWidth, height: tileHeight}
      },
      drawTile: (tileId, x, y, context) => {
        const xoffset = (tileId % numColumns) * tileWidth
        const yoffset = Math.floor(tileId / numColumns) * tileHeight
        context.drawImage(image,
          xoffset, yoffset,
          tileWidth, tileHeight,
          x, y,
          tileWidth, tileHeight)
      }
    }
  }
}

const VerticalTileStrip = {
  create: (tileSet, tileIds) => {
    const animatedTileMap = new Map()
    for (const tileId of tileIds) {
      const animationInfo = tileSet.getTileAnimationInfo(tileId)
      if (animationInfo !== undefined) {
        if (!animatedTileMap.has(tileId)) {
          animatedTileMap.set(tileId, {
            currentFrame: 0,
            elapsedTime: 0,
            frames: animationInfo
          })
        }
      }
    }

    return {
      update: (deltaTime) => {
        for (const k of animatedTileMap){
          k[1].elapsedTime += deltaTime
          while (k[1].elapsedTime >= k[1].frames[k[1].currentFrame].duration) {
            k[1].elapsedTime -= k[1].frames[k[1].currentFrame].duration
            k[1].currentFrame++
            if (k[1].currentFrame >= k[1].frames.length) k[1].currentFrame = 0
          }
        }
      },
      render: (x, y, context) => {
        for (const tileId of tileIds) {
          if (!animatedTileMap.has(tileId)) {
            tileSet.drawTile(tileId, x, y, context)
          } else {
            const animationInfo = animatedTileMap.get(tileId)
            const currentFrame = animationInfo.currentFrame
            const realTileId = animationInfo.frames[currentFrame].tileid
            tileSet.drawTile(realTileId, x, y, context)
          }

          y += tileSet.getTileSize().height
        }
      }
    }
  }
}

exports.TileSet = TileSet
exports.VerticalTileStrip = VerticalTileStrip

},{"./resource":7}],9:[function(require,module,exports){
const GamePresenter = {
  create: (canvas) => {
    let currentScene = GameScene.create()

    return {
      presentScene: function(nextScene) {
        nextScene.presenter = this

        // setup events for PC or iPhone
        const is_iPhone = navigator.userAgent.match(/iPhone/gi) !== null
        if (!is_iPhone) {
          canvas.width = 750 / 2
          canvas.height = 1334 / 2

          window.onkeydown = (event) => { nextScene.onKeyDown(event.key) }
          window.onkeyup = (event) => { nextScene.onKeyUp(event.key) }
          window.onmousedown = (event) => {
            nextScene.onMouseDown(event.button,
              {x: event.clientX, y: event.clientY})
          }

          window.onmouseup = (event) => {
            nextScene.onMouseUp(event.button,
              {x: event.clientX, y: event.clientY})
          }

          window.onmousemove = (event) => {
            nextScene.onMouseMove({x: event.clientX, y: event.clientY})
          }
        } else {
        }

        nextScene.onPresent()
        currentScene = nextScene
      },
      getCurrentScene: () => currentScene,
      getCanvasSize: () => {
        return {
          width: canvas.width,
          height: canvas.height
        }
      },
      update: (deltaTime) => { currentScene.update(deltaTime) },
      render: () => {
        const context = canvas.getContext('2d')
        context.imageSmoothingEnabled = false
        currentScene.render(context)
      }
    }
  }
}

const GameScene = {
  create: () => {
    return {
      presenter: null,
      onPresent: () => {},
      onKeyDown: (key) => {},
      onKeyUp: (key) => {},
      onMouseDown: (button, position) => {},
      onMouseUp: (button, position) => {},
      onMouseMove: (position) => {},
      update: (deltaTime) => {},
      render: (context) => {}
    }
  }
}

exports.GamePresenter = GamePresenter
exports.GameScene = GameScene

},{}],"game":[function(require,module,exports){
const view = require('./view')
const LoadingScene = require('./game_scenes').LoadingScene
const LogoScene = require('./game_scenes').LogoScene
const FadeTransitionScene = require('./game_scenes').FadeTransitionScene
const ResourceMap = require('./resource').ResourceMap
const Vector2 = require('./linalg').Vector2

const game = {
  init: function(canvas) {
    this.presenter = view.GamePresenter.create(canvas)
    this.startTime = null

    this.presenter.presentScene(LoadingScene.create())

    // load all required assets (images/sounds/etc)
    ResourceMap.init().then(() => {
      // setup scenes
      this.presenter.presentScene(FadeTransitionScene.create(LogoScene.create(),
        3000))
    })
  },
  update: function(currentTime) {
    if (this.startTime === null) this.startTime = currentTime
    const deltaTime = currentTime - this.startTime
    this.startTime = currentTime

    this.presenter.update(deltaTime)
    this.presenter.render()
  }
}

module.exports = game

},{"./game_scenes":5,"./linalg":6,"./resource":7,"./view":9}]},{},[]);
