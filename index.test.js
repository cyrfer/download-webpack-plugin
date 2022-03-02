const DownloadPlugin = require('./index')
const WebpackCompilerMock = require('./test/mock/WebpackCompilerMock')
const path = require('path')
const fs = require('fs')

const fileExists = (filepath) => {
  return fs.existsSync(filepath)
}

// https://stackoverflow.com/a/20920795/1740008
var deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      var curPath = path + "/" + file
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath)
      } else { // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

describe('webpack-plugin', () => {
  const outputPath = 'test-dist'

  beforeEach(() => {
    // make sure folder exists for writing
    // fs.statSync(outputPath)
    // fsExtra.ensureDirSync(outputPath)
  })

  afterEach(() => {
    deleteFolderRecursive(outputPath)
  })

  test('the plugin unzips downloaded contents', async () => {
    const embeddedEntry = "NotoSans-Regular.ttf"

    const source = {
      url: 'https://fonts.google.com/download?family=Noto%20Sans',
      contentDisposition: 'NotoSans.zip',
      unzip: true,
    }

    const pluginOptions = {
      path: 'fonts',
      sources: [source],
    }

    const plugin = new DownloadPlugin(pluginOptions)
    expect(plugin).not.toBeNull()

    const expectedOutputFile = path.join(outputPath, pluginOptions.path, embeddedEntry)

    // pre-conditions
    expect(fileExists(expectedOutputFile)).toBeFalsy()

    const webpackCompiler = new WebpackCompilerMock()

    // simulate parsing webpack.config.js
    webpackCompiler.setup({
      output: {
        path: outputPath,
      },
      plugins: [
        plugin,
      ]
    })

    // simulate executing webpack
    await webpackCompiler.run()

    // post-conditions
    expect(fileExists(expectedOutputFile)).toBeTruthy()
  })

})
