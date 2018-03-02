const app = require('express')(),
    fs = require('fs'),
    path = require('path'),
    morgan = require('morgan'),
    redis = require('redis'),
    redisClient = redis.createClient()

/* Constant vars in CAPITAL */
const MEDIA_PATH = './media',
    PORT = 1301

/* Client connections here */
redisClient.on('connect', () => {
    console.log('redis connection successfull!')
})

/* Chunked stream based on
 * byte range offered by client
 */
app.get('/stream/:id', (req, res) => {
    let {headers: {
                range
            }} = req,
        streamId = req.params.id

    if (!range) {
        return res.sendStatus(416)
    }

    redisClient.get(streamId, (err, audioInfo) => {
        if (err || !audioInfo) {
            return res.sendStatus(400)
        }

        audioInfo = JSON.parse(audioInfo)
        let filePath = audioInfo.path

        fs.stat(filePath, (err, stats) => {
            if (err) {
                return res.sendStatus(400)
            }

            let fileSize = stats.size,
                ranges = range
                    .replace('bytes=', '', 'g')
                    .split('-'),
                start = parseInt(ranges[0]),
                end = parseInt(ranges[1]) || fileSize - 1,
                streamChunk = end - start + 1

            res.writeHead(206, {
                'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
                'Accept-Ranges': 'bytes',
                'Content-Length': streamChunk,
                'Content-Type': 'audio/ogg'
            })

            let stream = fs.createReadStream(filePath, {start, end})
            stream.pipe(res)
        })
    })
})

/* Stream handler -- to be used with the client player */
app.get('/other/:id', (req, res) => {
    let {id} = req.params

    /* m3u8 or ts files are selected based on the extension name of the URI (id) */
    switch (path.extname(id)) {
        case '.m3u8':
            fs.readFile(MEDIA_PATH + id, (err, file) => {
                if (err) {
                    return res.sendStatus(400)
                }

                res.send(file)
            });
            break
        case '.ts':
            let tsStream = fs.createReadStream(MEDIA_PATH + id);
            tsStream.pipe(res);
            break
        default:
            res.sendStatus(500)
    }
})

/* Demo html */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(PORT)