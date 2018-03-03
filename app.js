import express from 'express'
import fs from 'fs'
import path from 'path'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import redis from 'redis'
import cookieParser from 'cookie-parser'
import favicon from 'favicon'

const app = express(),
    redisClient = redis.createClient()

/* Constant vars in CAPITAL */
const MEDIA_PATH = './media',
    PORT = 1301

/* Client connections here */
redisClient.on('connect', () => {
    console.log('redis connection successfull!')
})

/* Use declarations */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(favicon(path.join(__dirname, 'public', 'images/favc.png')));
app.use(morgan('dev'));
app.use(bodyParser.json({limit: '15mb'}));
app.use(bodyParser.urlencoded({limit: '15mb', extended: false}));
app.use(cookieParser('putthecookiesinthecookiejar'));
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: 365 * 24 * 60 * 60 * 1000
}));

/* Routes go here */
app.use('/', require('./routes/stream'))

/* Demo html */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(PORT)

//"start": "nodemon app.js --exec babel-node --presets es2015,stage-2"