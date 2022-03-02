# Download - a Webpack Plugin

This plugin allows users to specify a list of sources to be downloaded.
The results will be emitted into the build distribution.

## Usage
This example shows how to configure `webpack.config.js` so that a Google Font is downloaded.

```javascript
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const DownloadPlugin = require('download-webpack-plugin')

const targetDir = path.resolve(__dirname, '../src')

module.exports = {
  mode: 'production',
  entry: './index.js',
  target: 'node',
  externalsPresets: { node: true },
  externals: nodeExternals(),
  output: {
    filename: 'index.js',
    path: targetDir,
    libraryTarget: 'commonjs',
  },
  plugins: [
    new DownloadPlugin({
      path: 'fonts',
      sources: [
        {
          url: 'https://fonts.google.com/download?family=Noto%20Sans',
          unzip: true,
        },
      ],
    }),
  ],
}

```