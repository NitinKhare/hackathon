const express = require('express');
const app = express();
const bodyParser = require('body-parser')
require('dotenv').config();
require('./db/connect');
const port = process.env.NODE_PORT || 3000;
const pino = require('pino-http')();
const cors = require('cors')
app.use(cors())

app.set('view engine', 'ejs');

app.use(pino)
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('ABM CAMPAIGN RUNNER');
})


//Routes Setup

const leads = require('./routes/leads');
const organisationInfo = require('./routes/orgInfo');
const prompt = require('./routes/prompt');
const email = require('./routes/emails');

app.use('/leads', leads)
app.use('/organisation-info', organisationInfo)
app.use('/prompt', prompt)
app.use('/email',email)
// Routes End

app.listen(port, () => {
  console.log(`Server started on Port ${port}`);
})

