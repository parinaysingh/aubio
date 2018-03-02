let app = require('express')(),
    fs = require('fs'),
    path = require('path'),
    MEDIA_PATH = './media/',
    PORT = 1301

/* Stream handler -- to be used with the client player */
app.get('/stream/:id', (req, res) => {
    let {
        id
    } = req.params

    /* m3u8 or ts files are selected based on the extension name of the URI (id) */
    switch (path.extname(id)) {
        case '.m3u8':
            fs.readFile(MEDIA_PATH + id, (err, file) => {
                if (err) {
                    return res.sendStatus(500)
                }

                res.send(file)
            })
            break
        case '.ts':
            let tsStream = fs.createReadStream(MEDIA_PATH + id)
            tsStream.pipe(res)
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