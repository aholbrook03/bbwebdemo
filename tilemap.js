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
