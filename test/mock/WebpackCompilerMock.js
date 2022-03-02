
// https://stackoverflow.com/a/21372567/1740008
const serial = (arr) => {
  return arr.reduce((previous, next) => {
    return previous.then(next)
  }, Promise.resolve())
}

// TODO: break this into its own package, so other plugins can use it.
class WebpackCompilerMock {
  constructor() {
    this.options = {}

    // interface for plugins
    this.hooks = {
      done: {
        tap: this._addTap('done'),
      },
    }

    // interface for running webpack
    this._hooks = Object.keys(this.hooks).reduce((accum, key) => {
      return {
        ...accum,
        [key]: {
          taps: [],
        },
      }
    }, {})

    this.stats = {}
  }

  // assumes all taps are async
  _addTap(hookName) {
    return (pluginName, callback) => {
      // convert taps into async commands
      this._hooks[hookName].taps.push(async () => {
        console.log('running webpack plugin ' + pluginName)
        return callback(this.stats)
      })
    }
  }

  // simulates parsing `webpack.config.js`
  setup(options) {
    Object.assign(this.options, options)

    const { plugins } = options

    plugins.forEach((plugin) => {
      // calls _addTap
      plugin.apply(this)
    })
  }

  // simulates executing `npm run build -> webpack`
  run() {
    // broadcast for the done hook
    console.log('running wepback compiler hook "done"')
    // chain promises serially
    return serial(this._hooks['done'].taps)
  }
}

module.exports = WebpackCompilerMock
