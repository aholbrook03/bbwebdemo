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
