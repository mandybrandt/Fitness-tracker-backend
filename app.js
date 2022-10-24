require("dotenv").config()
const express = require("express")
const cors = require('cors')
const app = express()
const router = require('./api');

app.use(cors())
app.use(express.json())

const morgan = require('morgan');
app.use(morgan('dev'));

// Setup your Middleware and API Router here
app.get('/', function (req, res) {
    res.send({msg: 'home'})
  })

app.use('/api', router);

module.exports = app;