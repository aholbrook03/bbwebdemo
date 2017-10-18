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

    for (const stageName of GameConfig.STAGE_LIST) {
      promiseList.push((new Promise((resolve) => {
        $.get(stageName).then((data) => {
          if (typeof data === 'string') resolve(JSON.parse(data))
          else resolve(data)
        })
      })).then((data) => { resourcesRef.set(stageName, data) }))
    }

    return Promise.all(promiseList)
  },
  get: function(name) { return this.resources.get(name) }
}

exports.ResourceMap = ResourceMap
