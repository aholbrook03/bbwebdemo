require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const GameConfig = {
  TILESET_SOURCE: 'tileset.json',
  STAGE_LIST: (() => {
    const tmpList = []
    for (let i = 0; i < 10; ++i) tmpList.push('1-' + i + '.json')
    return tmpList
  })(),
  RESOURCE_LIST: ['world_01_loop.wav', 'tileset.png', 'logo0.png', 'logo1.png',
    'logo2.png', 'logo3.png', 'tileset.json']
}

exports.GameConfig = GameConfig

},{}],2:[function(require,module,exports){
const view = require('./view')
const ResourceMap = require('./resource').ResourceMap
const TileSet = require('./tilemap').TileSet

const StageScene = {
  create: () => {
    const scene = view.GameScene.create()
    return scene
  }
}

const LogoScene = {
  create: () => {
    const scene = view.GameScene.create()
    scene.logoImages = []
    for (let i = 1; i < 4; ++i) scene.logoImages.push(
      ResourceMap.get('logo' + i.toString() + '.png'))

    scene.render = function(context) {
      const canvasSize = this.presenter.getCanvasSize()
      context.fillStyle = 'rgb(0, 0, 0)'
      context.fillRect(0, 0, canvasSize.width, canvasSize.height)
      const x = 0
      const y = 0
      context.drawImage(this.logoImages[2],
        x, y,
        this.logoImages[2].width * .5, this.logoImages[2].height * .5)
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
      oldScene.render(oldSceneSnapshot.getContext('2d'))

      newSceneSnapshot = document.createElement('canvas')
      newSceneSnapshot.width = canvasSize.width
      newSceneSnapshot.height = canvasSize.height

      newScene.presenter = this.presenter
      newScene.render(newSceneSnapshot.getContext('2d'))
    }

    scene.update = function(deltaTime) {
      elapsedTime += deltaTime
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

},{"./resource":4,"./tilemap":5,"./view":6}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
const GameConfig = require('./config').GameConfig

const ResourceMap = {
  resources: new Map(),
  init: function() {
    const resourcesRef = this.resources
    const isImage = (s) => s.match(/\.png/i) !== null
    const isAudio = (s) => s.match(/\.wav/i) !== null
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
        })).then((audio) => { resourcesRef.set(resource, audio) }))
      } else if (isJSON(resource)) {
        promiseList.push((new Promise((resolve) => {
          $.get(resource).then((data) => { resolve(data) })
        })).then((data) => { resourcesRef.set(resource, data) }))
      }
    }

    return Promise.all(promiseList)
  },
  get: function(name) { return this.resources.get(name) }
}

exports.ResourceMap = ResourceMap

},{"./config":1}],5:[function(require,module,exports){
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
      getTileSize: () => [tileWidth, tileHeight],
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

exports.TileSet = TileSet

},{"./resource":4}],6:[function(require,module,exports){
const GamePresenter = {
  create: (canvas) => {
    let currentScene = GameScene.create()
    let context = canvas.getContext('2d')
    let scale = 1.0

    return {
      presentScene: function(nextScene) {
        nextScene.presenter = this

        const is_iPhone = navigator.userAgent.match(/iPhone/gi) !== null
        if (!is_iPhone) {
          canvas.width = 750
          canvas.height = 1334

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
      render: () => { currentScene.render(context) }
    }
  }
}

const GameScene = {
  create: () => {
    return {
      presenter: null,
      onPresent: () => {},
      onKeyDown: (key) => { console.log(key) },
      onKeyUp: (key) => { console.log(key) },
      onMouseDown: (button, position) => { console.log(button) },
      onMouseUp: (button, position) => { console.log(button) },
      onMouseMove: (position) => { console.log(position) },
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

},{"./game_scenes":2,"./linalg":3,"./resource":4,"./view":6}]},{},[]);
