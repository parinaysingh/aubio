import path from 'path'
import ffmpeg from 'ffmpeg'
import {spawn} from 'child_process'
import multer from 'multer'
import express from 'express'
import FFDiskStorage from '../storage/ff-disk-storage'

const Router = express.Router()

const Store = FFDiskStorage({
    filename: function (req, file, callback) {
        let ext = path.extname(file.originalname),
            newFileName = Math
                .random()
                .toString(36)

        callback(null, newFileName)
    }
})


const Storage = multer.diskStorage({
    filename: function (req, file, callback) {
        let ext = path.extname(file.originalname),
            newFileName = Math
                .random()
                .toString(36) + ext
        console.log(newFileName)

        callback(null, newFileName)
    }
})

const upload = multer({storage: Store}).single("audio_file")

Router.post('/', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.sendStatus(400)
        }

        console.log('File Stats:', req.file)

        res.sendStatus(200)
    })
})

module.exports = Router