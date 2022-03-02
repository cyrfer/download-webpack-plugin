const Axios = require('axios')
// const uuid = require('uuid')
const path = require('path')
const os = require('os')
const {createWriteStream, unlink, mkdirSync} = require('fs')
const { promisify } = require('util')
const yauzl = require('yauzl')
const { pipeline } = require('stream')
// const { unzip } = require('zlib')

// https://stackoverflow.com/a/61269447/1740008
async function download(fileUrl) {
  return Axios({ method: 'get', url: fileUrl, responseType: 'stream', })
}

const entryStreamHandler = ({entryFilePath, zipfile}) => (err, readStream) => {
  if (err) {
    console.log('zipfile.openReadStream recieved error, ', err)
    throw err
  }

  readStream.on('end', () => {
    // queue up the next entry
    zipfile.readEntry()
  })

  console.log('zipfile.openReadStream, writing to file,', entryFilePath)
  readStream.pipe(createWriteStream(entryFilePath))
}

function unzipContents(sourceFilePath, outputDir) {
  console.log('unzipContents', sourceFilePath, outputDir)
  // return Promise.resolve()
  return new Promise((resolve, reject) => {
    yauzl.open(sourceFilePath, {lazyEntries: true}, function(err, zipfile) {
      if (err) {
        console.log('zipfile.open recieved error, ', err)
        throw err
      }

      zipfile.on("error", function(err) {
        console.log('zipfile.on("error") recieved, ', err)
        // zipfile.close()
        reject(err)
      })

      zipfile.on("entry", function(entry) {
        // console.log('zipfile.on("entry") recieved, ', entry)

        const entryFilePath = path.join(outputDir, entry.fileName)
        zipfile.openReadStream(entry, entryStreamHandler({entryFilePath, zipfile}))
      })

      zipfile.on("end", () => {
        console.log('zipfile.on("end")')
        resolve()
      })

      // start working on entries
      zipfile.readEntry()
    })
  })
}



function writeContents(sourceStream, outputLocationPath) {
  console.log('writeContents to file, ', outputLocationPath)
  const writeStream = createWriteStream(outputLocationPath)
  const pipe = promisify(pipeline)
  return pipe(sourceStream, writeStream)
}

function deleteFile(sourceFilePath) {
  console.log('deleting file, ', sourceFilePath)
  const unlinkPromise = promisify(unlink)
  return unlinkPromise(sourceFilePath)
}

const partRegex = /^filename="(.*)"$/

function getFileNameFromResponse(response, defaultName) {
  const dispositionHeader = response.headers['content-disposition'] || ''
  const headerParts = dispositionHeader.split('; ')
  const dispositionPart = headerParts.find(part => partRegex.test(part))
  const matches = !dispositionPart
    ? []
    : dispositionPart.match(partRegex)
  const contentDisposition = (!matches || matches.length < 2)
    ? defaultName
    : matches[1]

  return contentDisposition
}

class DownloadPlugin {
  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    compiler.hooks.done.tap("DownloadPlugin", (stats) => {
      console.log(`DownloadPlugin is running on ${JSON.stringify(this.options)}`)
      // console.log("stats", stats)

      return Promise.all(this.options.sources.map(source => {
        const outputDir = path.join(compiler.options.output.path, this.options.path)
        return download(source.url).then(axiosResponse => {
          const contentDisposition = getFileNameFromResponse(axiosResponse, source.contentDisposition || 'downloaded-webpack-plugin')
          const contentType = axiosResponse.headers['content-type']
          if (source.unzip && contentType === 'application/zip') {
            const tmpPath = path.join(os.tmpdir(), contentDisposition)
            return writeContents(axiosResponse.data, tmpPath).then(() => {
              mkdirSync(outputDir, {recursive: true})
              return unzipContents(tmpPath, outputDir)
            }).then(() => {
              return deleteFile(tmpPath)
            })
          } else {
            mkdirSync(outputDir, {recursive: true})
            const finalDestination = path.join(outputDir, contentDisposition)
            return writeContents(axiosResponse.data, finalDestination)
          }
        })
      }))
    })
  }
}

module.exports = DownloadPlugin
