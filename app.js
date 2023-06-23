const express = require('express');
const app = express();
const bodyParser = require('body-parser')
require('dotenv').config();
require('./db/connect');
const port = process.env.NODE_PORT || 3000;
const pino = require('pino-http')();



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

app.use('/leads', leads)
app.use('/organisation-info', organisationInfo)

// Routes End

app.listen(port, () => {
  console.log(`Server started on Port ${port}`);
})

