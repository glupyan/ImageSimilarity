// Dependencies
const express = require('express');
const path = require("path");
const PythonShell = require('python-shell');
const fs = require('fs');
const fsPromises = require("fs").promises;
const csvWriter = require("csv-write-stream");
const _ = require('lodash');
const bodyParser = require('body-parser');
const csv = require('csvtojson');
const getPort = require("get-port");
const jsonfile = require('jsonfile');

let app = express();
let writer = csvWriter({sendHeaders: false});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

function createFolderIfDoesntExist(foldername) {
  if (!fs.existsSync(path.join(__dirname, foldername))) {
    fs.mkdirSync(path.join(__dirname, foldername));
  }
}

createFolderIfDoesntExist("demographics");
createFolderIfDoesntExist("trials");
createFolderIfDoesntExist("data");

(async () => {
  const PORT = await getPort({ port: getPort.makeRange(7100, 7199) });
  console.log(PORT)
  app.set("port", PORT);
  await fsPromises.writeFile(
    path.join("dev", "port.js"),
    `export default ${PORT};\n`
  );

  createFolderIfDoesntExist("prod");
  await fsPromises.writeFile(
    path.join("prod", "port.js"),
    `export default ${PORT};\n`
  );

  app.listen(app.get("port"), function() {
    console.log("Node app is running at http://localhost:" + app.get("port"));
  });
})();


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


// POST endpoint for receiving demographics responses
app.post('/demographics', function (req, res, next) {
  let demographics = req.body;
  console.log('demographics post request received');
  console.log(demographics);
  let path = 'demographics/' + demographics.subjCode + '_demographics.csv';

  fs.access('./demographics', (err) => {
    if (err && err.code === 'ENOENT') {
      fs.mkdir('./demographics', () => {
        next();
      });
    }
    else next();
  });

},
  (req, res, next) => {
    let demographics = req.body;
    let path = 'demographics/' + demographics.subjCode + '_demographics.csv';
    fs.access(path, (err) => {
      if (err && err.code === 'ENOENT') {
        jsonfile.writeFile(path, { trials: [] }, (err) => {
          if (err) {
            res.send({ success: false });
            return next(err);
          }
          next();
        })
      }
      else next();
    })
  }, (req, res, next) => {
    // Parses the trial response data to csv
    let demographics = req.body;
    let path = 'demographics/' + demographics.subjCode + '_demographics.csv';

    writer = csvWriter({ headers: ['subjCode', 'question', 'response'] });

    writer.pipe(fs.createWriteStream(path, { flags: 'w' }));
    demographics.responses.forEach((response) => {
      writer.write(response);
    });
    writer.end();

    res.send({ success: true });
  });

