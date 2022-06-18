var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cors = require('cors')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const csv = require('csv-parser');

const { parse } = require("csv-parse");

var indexRouter = require('./routes/index');
var fs = require('fs');
var csvWriter = require('csv-write-stream')
var writer = csvWriter()
writer.pipe(fs.createWriteStream('out.csv'))

var app = express();
app.use(cors())


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.post('/register', ((req, res) => {
    const login = req.body.login
    const password = req.body.password
    writer.write({"login": login, "password": password})

    res.send('ok')
}))

app.post('/server', ((req, res) => {
    const login = req.body.login
    const password = req.body.password
    let found = false

    fs.createReadStream('out.csv')
        .on('error', () => {

        })
        .pipe(csv())
        .on('data', (row) => {
            if (row["login"] === login) {
                if (row["password"] === password) {
                    res.send({result: "success"})
                    found = true
                }
            }
            console.log(row["password"]);
        })
        .on('end', () => {
            if(!found) {
                res.send({result: "fail"})
            }
        })
}))


module.exports = app;
