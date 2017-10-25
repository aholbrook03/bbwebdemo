const GameConfig = {
  init: function() {
    const Snake = require('./game_entities').Snake
    const Squirrel = require('./game_entities').Squirrel
    this.entityIds = new Map([[9, Snake], [14, Squirrel]])
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
    idle: 422, roll: 205, rollUp: 461, rollDown: 462
  },
  squirrelIds: {
    idle: 14, throw: 15
  },
  snakeIds: {
    idle: 9
  },
  boulderBoySpeed: 16 / 500.0,
  boulderBoyRadius: 5,
  enemyRadius: 5,
  stageSelectBackgroundScrollSpeed: 375.0 / 15000.0
}

exports.GameConfig = GameConfig
