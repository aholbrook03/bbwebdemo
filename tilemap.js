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
