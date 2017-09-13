// Dependencies
const express = require('express');
const path = require("path");
const PythonShell = require('python-shell');
const fs = require('fs');
const csvWriter = require("csv-write-stream");
const _ = require('lodash');
const bodyParser = require('body-parser');
const csv = require('csvtojson');

let app = express();
let writer = csvWriter({sendHeaders: false});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('port', (process.env.PORT || 7070))

// Add headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// For Rendering HTML
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/dev/index.html'));
})
app.use(express.static(__dirname + '/dev'));

app.listen(app.get('port'), function () {
  console.log("Node app is running at http://localhost:" + app.get('port'))
})


// POST endpoint for requesting trials
app.post('/trials', function (req, res) {
  console.log("trials post request received");
  let subjCode = req.body.subjCode;
  console.log("subjCode received is " + subjCode);

  // Runs genTrial python script with subjCode arg
  PythonShell.defaultOptions = { args: [subjCode] };
  PythonShell.run('generateTrials.py', function (err, results) {
    if (err) throw err;
    let trials = [];

    // Reads generated trial csv file
    csv()
    .fromFile('trials/'+subjCode+'_trials.csv')
    // Push all trials to array
    .on('json',(jsonObj)=>{
      trials.push(jsonObj);
    })
    // Send trials array when finished
    .on('done',(error)=>{
      if (error) {
        res.send({success: false});
        throw error;
      }
      res.send({success: true, trials: trials});
      console.log('finished parsing csv')
    })
  });
})

// POST endpoint for receiving trial responses
app.post('/data', function (req, res) {
  console.log('data post request received');

  // Parses the trial response data to csv
  let response = req.body;
  let path = 'data/'+response.subjCode+'_data.csv';
  let headers = Object.keys(response);
  if (!fs.existsSync(path))
    writer = csvWriter({ headers: headers});
  else
    writer = csvWriter({sendHeaders: false});

  writer.pipe(fs.createWriteStream(path, {flags: 'a'}));
  writer.write(response);
  writer.end();

  res.send({success: true});
})