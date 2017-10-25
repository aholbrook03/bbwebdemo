const GamePresenter = {
  create: (canvas) => {
    let currentScene = GameScene.create()

    return {
      presentScene: function(nextScene) {
        nextScene.presenter = this

        // setup events for PC or iPhone
        const is_iPhone = navigator.userAgent.match(/iPhone/gi) !== null
        if (!is_iPhone) {
          canvas.width = 750 / 2
          canvas.height = 1334 / 2

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

        currentScene.onExit()
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
      render: () => {
        const context = canvas.getContext('2d')
        context.imageSmoothingEnabled = false
        currentScene.render(context)
      }
    }
  }
}

const GameScene = {
  create: () => {
    return {
      presenter: null,
      scale: 1.0,
      onPresent: () => {},
      onExit: () => {},
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
