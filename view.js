const GamePresenter = {
  create: (canvas) => {
    let currentScene = GameScene.create()
    let context = canvas.getContext('2d')
    let scale = 1.0

    return {
      presentScene: function(nextScene) {
        nextScene.presenter = this

        // setup events for PC or iPhone
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
        } else {
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
      onKeyDown: (key) => {},
      onKeyUp: (key) => {},
      onMouseDown: (button, position) => {},
      onMouseUp: (button, position) => {},
      onMouseMove: (position) => {},
      update: (deltaTime) => {},
      render: (context) => {}
    }
  }
}

exports.GamePresenter = GamePresenter
exports.GameScene = GameScene
