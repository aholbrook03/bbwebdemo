const GameConfig = {
  init: function() {
    const BoulderBoy = require('./game_entities').BoulderBoy
    this.entityIds = {1: BoulderBoy}
  },
  TILESET_SOURCE: 'tileset.json',
  STAGE_LIST: (() => {
    const tmpList = []
    for (let i = 1; i <= 15; ++i) tmpList.push('1-' + i + '.json')
    return tmpList
  })(),
  RESOURCE_LIST: ['world_01_loop.wav', 'tileset.png', 'logo0.png', 'logo1.png',
    'logo2.png', 'logo3.png', 'tileset.json', 'Trailer_Theme_Ver1.mp3'],
  boulderBoyIds: {
    idleLeft: 422, rollLeft: 205, rollUp: 461, rollDown: 462
  },
  squirrelIds: {
    idleLeft: 14, throwLeft: 15
  },
  snakeIds: {
    idleLeft: 9
  }
}

exports.GameConfig = GameConfig
