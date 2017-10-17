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
