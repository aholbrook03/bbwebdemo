const view = require('./view')
const GameConfig = require('./config').GameConfig
const ResourceMap = require('./resource').ResourceMap
const TileSet = require('./tilemap').TileSet
const TileMap = require('./tilemap').TileMap
const VerticalTileStrip = require('./tilemap').VerticalTileStrip
const BlinkingLogo = require('./game_entities').BlinkingLogo
const ScrollingBackground = require('./game_entities').ScrollingBackground
const Vector2 = require('./linalg').Vector2

const StageScene = {
  create: (name, tileMap) => {
    const scrollingBackground = ScrollingBackground.create(
      ResourceMap.get('logo3.png'),
      Vector2.create(-1, -1).setLength(375 / 10000))
    console.log(scrollingBackground)
    const scene = view.GameScene.create()

    scene.onPresent = () => { ResourceMap.get('Trailer_Theme_Ver1.mp3').stop() }

    scene.render = (context) => {
      tileMap.render(0, 0, context)
    }

    return scene
  }
}

const StageSelectScene = {
  create: () => {
    const tileSet = TileSet.createFromJSON(ResourceMap.get('tileset.json'))
    const scene = view.GameScene.create()
    const stageTileMaps = []
    let currentStageIndex = 0
    let stageLabel = 'Stage 1-' + (currentStageIndex + 1).toString()

    const ARROW_TILEIDS = [581, 613]
    let arrowTileIdIndex = 0
    const ARROW_BLINK_DELAY = 250
    const ARROW_SCALE = 3
    let leftArrowX = 0
    let leftArrowY = 0
    let rightArrowX = 0
    let rightArrowY = 0

    let elapsedTime = 0

    scene.onPresent = function() {
      for (const stageName of GameConfig.STAGE_LIST) {
        stageTileMaps.push(TileMap.create(ResourceMap.get(stageName), tileSet))
      }

      const canvasSize = this.presenter.getCanvasSize()
      const tileSize = tileSet.getTileSize()
      const mapSize = stageTileMaps[currentStageIndex].getSizeInPixels()

      // setup arrow positions
      leftArrowX = 0
      leftArrowY = Math.floor(canvasSize.height / 2 - tileSize.height / 2)
      leftArrowY /= ARROW_SCALE
      rightArrowX = Math.floor(canvasSize.width - tileSize.width * ARROW_SCALE)
      rightArrowX /= ARROW_SCALE
      rightArrowY = leftArrowY
    }

    scene.onMouseDown = function(button, position) {
      const tileSize = tileSet.getTileSize()

      // check if left arrow was clicked
      let scaledArrowX = leftArrowX * ARROW_SCALE
      let scaledArrowX2 = scaledArrowX + tileSize.width * ARROW_SCALE
      let scaledArrowY = leftArrowY * ARROW_SCALE
      let scaledArrowY2 = scaledArrowY + tileSize.height * ARROW_SCALE
      if (position.x >= scaledArrowX && position.x <= scaledArrowX2) {
        if (position.y >= scaledArrowY && position.y <= scaledArrowY2) {
          currentStageIndex--
          if (currentStageIndex === -1)
            currentStageIndex = stageTileMaps.length - 1
        }
      }

      // check if right arrow was clicked
      scaledArrowX = rightArrowX * ARROW_SCALE
      scaledArrowX2 = scaledArrowX + tileSize.width * ARROW_SCALE
      scaledArrowY = rightArrowY * ARROW_SCALE
      scaledArrowY2 = scaledArrowY + tileSize.height * ARROW_SCALE
      if (position.x >= scaledArrowX && position.x <= scaledArrowX2) {
        if (position.y >= scaledArrowY && position.y <= scaledArrowY2) {
          currentStageIndex++
          if (currentStageIndex === stageTileMaps.length) currentStageIndex = 0
        }
      }

      stageLabel = 'Stage 1-' + (currentStageIndex + 1).toString()

      // check if stage map was clicked
      const canvasSize = this.presenter.getCanvasSize()
      const tileMapSize = stageTileMaps[currentStageIndex].getSizeInPixels()
      const mapX = canvasSize.width / 2 - tileMapSize.width / 2
      const mapY = canvasSize.height / 2 - tileMapSize.height / 2
      const mapX2 = mapX + tileMapSize.width
      const mapY2 = mapY + tileMapSize.height
      if (position.x >= mapX && position.x <= mapX2) {
        if (position.y >= mapY && position.y <= mapY2) {
          this.presenter.presentScene(StageScene.create(stageLabel,
            stageTileMaps[currentStageIndex]))
        }
      }
    }

    scene.update = function(deltaTime) {
      elapsedTime += deltaTime
      while (elapsedTime >= ARROW_BLINK_DELAY) {
        elapsedTime -= ARROW_BLINK_DELAY
        arrowTileIdIndex++
        if (arrowTileIdIndex === ARROW_TILEIDS.length) arrowTileIdIndex = 0
      }
      this.scrollingOffsetX -= this.deltaOffsetX * deltaTime
      if (this.scrollingOffsetX <= -tileSet.getTileSize().width) {
        this.scrollingOffsetX = 0
      }

      this.tileStrip.update(deltaTime)
    }

    scene.render = function(context) {

      // draw background
      context.scale(2, 2)
      for (let i = 0; i < 13; ++i)
        this.tileStrip.render(
          i * 16 + Math.floor(this.scrollingOffsetX),
          0,
          context)
      context.setTransform(1, 0, 0, 1, 0, 0)

      // draw stage map
      const canvasSize = this.presenter.getCanvasSize()
      const tileSize = tileSet.getTileSize()
      const tileMapSize = stageTileMaps[currentStageIndex].getSizeInPixels()
      const mapX = canvasSize.width / 2 - tileMapSize.width / 2
      const mapY = canvasSize.height / 2 - tileMapSize.height / 2
      stageTileMaps[currentStageIndex].render(mapX, mapY, context)

      // draw arrows
      context.scale(ARROW_SCALE, ARROW_SCALE)
      tileSet.drawRotatedTile(ARROW_TILEIDS[arrowTileIdIndex],
        leftArrowX, leftArrowY, -90, context)
      context.setTransform(1, 0, 0, 1, 0, 0)

      context.scale(ARROW_SCALE, ARROW_SCALE)
      tileSet.drawRotatedTile(ARROW_TILEIDS[arrowTileIdIndex],
        rightArrowX, rightArrowY, 90, context)
      context.setTransform(1, 0, 0, 1, 0, 0)

      // draw stage label
      context.fillStyle = 'rgb(0, 0, 0)'
      context.font = "32px retro";

      const x = canvasSize.width / 2 - context.measureText(stageLabel).width / 2
      const y = canvasSize.height / 2 + tileMapSize.height / 2 + 40
      context.fillText(stageLabel, x, y)
    }

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
      if (position.x < canvasSize.width && position.y < canvasSize.height) {
        const stageSelectScene = StageSelectScene.create()
        stageSelectScene.tileStrip = tileStrip
        stageSelectScene.scrollingOffsetX = scrollingOffsetX
        stageSelectScene.deltaOffsetX = deltaOffsetX
        this.presenter.presentScene(stageSelectScene)
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

      context.scale(2, 2)
      for (let i = 0; i < 13; ++i)
        tileStrip.render(i * 16 + Math.floor(scrollingOffsetX), 0, context)
      context.setTransform(1, 0, 0, 1, 0, 0)

      blinkingLogo.render( canvasSize.width / 2, canvasSize.height / 2, 0.5,
        context)

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
