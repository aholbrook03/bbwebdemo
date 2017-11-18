const ResourceMap = require('./resource').ResourceMap
const GameConfig = require('./config').GameConfig

const TileMap = {
  create: (json, tileSet) => {
    const BLANK_TILEID = 0
    const FLIP_HORIZONTAL = 0x80000000
    const FLIP_VERTICAL = 0x40000000
    const FLIP_DIAGONAL = 0x20000000
    const ORIENTATION_BITS = FLIP_HORIZONTAL | FLIP_VERTICAL | FLIP_DIAGONAL
    const FIRST_GID = 1

    const tileAnimationMap = new Map()

    const layers = []
    for (const layer of json.layers) {
      if (layer.type === 'tilelayer') {
        const layerData = {
          tiles: []
        }

        for (const tileId of layer.data) {
          const tileOrientation = tileId & ORIENTATION_BITS
          const realTileId = tileId & ~tileOrientation
          const tileObj = {
            flipHorizontal: (tileOrientation & FLIP_HORIZONTAL) !== 0,
            flipVertical: (tileOrientation & FLIP_VERTICAL) !== 0,
            flipDiagonal: (tileOrientation & FLIP_DIAGONAL) !== 0,
            tileId: realTileId
          }

          layerData.tiles.push(tileObj)

          const animationInfo = tileSet.getTileAnimationInfo(realTileId - FIRST_GID)
          if (animationInfo !== undefined) {
            if (!tileAnimationMap.has(realTileId - FIRST_GID)) {
              tileAnimationMap.set(realTileId - FIRST_GID, {
                frames: animationInfo,
                currentFrameIndex: 0,
                elapsedTime: 0
              })
            }
          }
        }

        layers.push(layerData)
      }
    }

    return {
      scale: 1.0,
      getTileSet: () => tileSet,
      getSizeInTiles: () => { return {
        width: json.width,
        height: json.height
      }},
      getSizeInPixels: function() { return {
        width: json.width * json.tilewidth * this.scale,
        height: json.height * json.tileheight * this.scale
      }},
      getNumberOfLayers: () => layers.length,
      findTile: (tileId) => {
        const found = []
        for (let layerIndex = 0; layerIndex < layers.length; ++layerIndex) {
          let row = 0
          let column = 0
          for (const tile of layers[layerIndex].tiles) {
            if (tile.tileId - FIRST_GID === tileId) {
              found.push({layerIndex, row, column})
            }

            column++
            if (column === json.width) {
              row++
              column = 0
            }
          }
        }

        return found
      },
      getTilesAt: (row, column) => {
        const tiles = []
        let layerIndex = 0
        for (const layer of layers) {
          const tileId = layer.tiles[row * json.width + column].tileId
          if (tileId !== BLANK_TILEID) {
            tiles.push({layerIndex: layerIndex, tileId: tileId - FIRST_GID})
          }
          layerIndex++
        }

        return tiles
      },
      getTilesInRadius: function(x, y, radius) {
        const tileSize = tileSet.getTileSize()
        const startRow = Math.floor((y - radius) / tileSize.height)
        const startColumn = Math.floor((x - radius) / tileSize.width)
        const endRow = Math.floor((y + radius) / tileSize.height)
        const endColumn = Math.floor((x + radius) / tileSize.width)

        const tiles = []
        for (let row = startRow; row <= endRow; ++row) {
          for (let column = startColumn; column <= endColumn; ++column) {
            for (const tile of this.getTilesAt(row, column)) tiles.push(tile)
          }
        }

        return tiles
      },
      getTilesInRect: function(x, y, width, height) {
      },
      getTileOrientation: function(layerIndex, row, column) {
        return layers[layerIndex].tiles[row * json.width + column]
      },
      removeTile: function(tileId) {
        for (const found of this.findTile(tileId)) {
          this.removeTileAt(found.layerIndex, found.row, found.column)
        }

        tileAnimationMap.delete(tileId)
      },
      removeTileAt: function(layerIndex, row, column) {
        const tileId = layers[layerIndex].tiles[row * json.width + column].tileId - FIRST_GID
        layers[layerIndex].tiles[row * json.width + column].tileId = BLANK_TILEID
        if (this.findTile(tileId).length === 0) tileAnimationMap.delete(tileId)
      },
      update: (deltaTime) => {
        for (const t of tileAnimationMap) {
          t[1].elapsedTime += deltaTime
          let frameDuration = t[1].frames[t[1].currentFrameIndex].duration
          while (t[1].elapsedTime >= frameDuration) {
            t[1].elapsedTime -= frameDuration
            t[1].currentFrameIndex++
            if (t[1].currentFrameIndex === t[1].frames.length) {
              t[1].currentFrameIndex = 0
            }

            frameDuration = t[1].frames[t[1].currentFrameIndex].duration
          }
        }
      },
      render: function(x, y, context) {
        x = Math.floor(x)
        y = Math.floor(y)

        for (const layer of layers) {
          let currentColumn = 0
          let currentX = x
          let currentY = y
          for (const tile of layer.tiles) {

            const tileId = tile.tileId
            if (tileId !== BLANK_TILEID) {
              let orientedX = currentX
              let orientedY = currentY
              let scaleX = this.scale
              let scaleY = this.scale
              let angle = 0

              if (tile.flipDiagonal) {
                scaleX = -this.scale
                angle = Math.PI / 2
                orientedX = -currentX - json.tilewidth
              }

              if (tile.flipHorizontal) {
                if (tile.flipDiagonal) {
                  scaleX = this.scale
                  orientedX = currentX
                } else {
                  scaleX = -this.scale
                  orientedX = -currentX - json.tilewidth
                }
              }

              if (tile.flipVertical) {
                scaleY = -this.scale
                orientedY = -currentY - json.tileheight
              }

              context.scale(scaleX, scaleY)
              context.translate(Math.floor(json.tilewidth / 2 + orientedX),
                Math.floor(json.tileheight /  2 + orientedY))
              context.rotate(angle)
              context.translate(Math.floor(-json.tilewidth / 2),
                Math.floor(-json.tileheight /  2))

              if (tileAnimationMap.has(tileId - FIRST_GID)) {
                const animationInfo = tileAnimationMap.get(tileId - FIRST_GID)
                const frames = animationInfo.frames
                const currentFrameIndex = animationInfo.currentFrameIndex
                const currentFrameTileId = frames[currentFrameIndex].tileid
                tileSet.drawTile(currentFrameTileId, 0, 0, context)
              } else {
                tileSet.drawTile(tileId - FIRST_GID, 0, 0, context)
              }

              context.setTransform(1, 0, 0, 1, 0, 0)
            }

            currentX += json.tilewidth
            currentColumn++
            if (currentColumn === json.width) {
              currentX = x
              currentY += json.tileheight
              currentColumn = 0
            }
          }
        }
      }
    }
  }
}

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
      },
      drawRotatedTile: function(tileId, x, y, angle, context) {
        context.translate(tileWidth / 2 + x, tileHeight / 2 + y)
        context.rotate(angle * Math.PI / 180)
        context.translate(-tileWidth / 2, -tileHeight / 2)
        this.drawTile(tileId, 0, 0, context)
        context.setTransform(1, 0, 0, 1, 0, 0)
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

exports.TileMap = TileMap
exports.TileSet = TileSet
exports.VerticalTileStrip = VerticalTileStrip
