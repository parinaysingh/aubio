import fs from 'fs'
import {spawn} from 'child_process'

class FFDiskStorage {
    constructor(options) {
        this.getDestination = (options.destination || this.getDestination)
        this.getFilename = (options.filename || this.getFilename)
    }

    _handleFile(req, file, cb) {
        this.getDestination(req, file, (err, path) => {
            if (err) 
                return cb(err)

            this.getFilename(req, file, (err, filename) => {
                if (err) 
                    return cb(err)

                let stream = file.stream,
                    filePath = path + filename + '.m4a',
                    ffmpeg = spawn('ffmpeg', [
                        '-i',
                        'pipe:0',
                        '-c:a',
                        'aac',
                        '-strict',
                        '-2',
                        '-b:a',
                        '256k',
                        `${filePath}`
                    ])

                stream.pipe(ffmpeg.stdin)

                ffmpeg.on('exit', (statusCode) => {
                    if (statusCode === 0) {
                        fs.stat(filePath, (err, stat) => {
                            if (err) return cb(err)

                            cb(null, {
                                path: filePath,
                                filename: filename + '.m4a',
                                size: stat.size,
                                mimetype: 'audio/aac'
                            })
                        })
                    }
                })

                ffmpeg
                    .stderr
                    .on('data', (err) => {
                        console.log(new String(err))
                    })
            })
        })
    }

    _removeFile(req, file, cb) {
        fs.unlink(file.path, cb)
    }

    getDestination(req, file, cb) {
        cb(null, 'media/')
    }

    getFilename(req, file, cb) {
        let originalname = file.originalname,
            extPosition = originalname.lastIndexOf('.'),
            name = originalname.substring(0, extPosition - 1)

        cb(null, name)
    }
}

module.exports = (options) => new FFDiskStorage(options)