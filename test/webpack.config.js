const path = require('path')
const nodeExternals = require('webpack-node-externals')
const DownloadPlugin = require('../index')
// const GoogleFontsPlugin = require("@beyonk/google-fonts-webpack-plugin")

const targetDir = path.resolve(__dirname, '../test-dist')

module.exports = {
  mode: 'production',
  entry: './index.js',
  target: 'node',
  externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
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
          contentDisposition: 'NotoSans.zip',
          unzip: true,
        },
      ],
    }),
    // new GoogleFontsPlugin({
    //   formats: ["ttf"],
    //   fonts: [
    //     { family: "Noto Sans", variants: ["regular", "italic"] },
    //     { family: "Tangerine" },
    //   ],
    //   path: 'fonts',
    // }),
    // consider using below, rather than GoogleFontsPlugin which suffers random API outages.
    // https://github.com/jonathantneal/google-fonts-complete
  ],
}
