import path from 'path'
import ffmpeg from 'ffmpeg'
import { spawn } from 'child_process'
import multer from 'multer'
import express from 'express'

const Router = express.Router()

const Storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Math.random().toString(36) + "_" + file.originalname);
    }
});

Router.post('/', function (req, res) {
    const upload = multer({storage: Storage}).single("audio_file");
    upload(req, res, function (err) {
        if (err) throw ("File Upload Failed!");
        const temp_file_path = req.file.path;
        const file_name = path.parse(req.file.filename).name;
        const ff = spawn('ffmpeg', ['-i', `${temp_file_path}`, '-c:a', 'aac', `media/${file_name}.aac`]);
        ff.on('close', (code) => {
            if (code == 0){
                res.send('Success');
            }else {
                res.send('Fail')
            }
        });
    })
})

module.exports = Router