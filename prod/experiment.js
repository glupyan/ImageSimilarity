import PORT from './port.js';


function disableScrollOnSpacebarPress () {
    window.onkeydown = function(e) {
      if (e.keyCode == 32 && e.target == document.body) {
        e.preventDefault();
      }
    };
  }
  
// Function Call to Run the experiment
export function runExperiment(trials, subjCode, workerId, assignmentId, hitId, FULLSCREEN) {
    disableScrollOnSpacebarPress();
    let timeline = [];

    // Data that is collected for jsPsych
    let turkInfo = jsPsych.turk.turkInfo();
    let participantID = makeid()+'iTi'+makeid()

    jsPsych.data.addProperties({
        subject: participantID,
        condition: 'explicit',
        group: 'shuffled',
        workerId: workerId,
        assginementId: assignmentId,
        hitId: hitId
    });

    let welcome_block = {
        type: "text",
        cont_key: ' ',
        text: `<h1>Image Simularity</h1>
        <p>Welcome to the experiment. Thank you for participating! Press SPACE to begin.</p>`
    };

    timeline.push(welcome_block);

    let continue_space = "<div class='right small'>(press SPACE to continue, or BACKSPACE to head back)</div>";

    let instructions = {
        type: "instructions",
        key_forward: ' ',
        key_backward: 8,
        pages: [
            `<p>In this experiment, you will see two drawings and rate their simularity from 1 to 7.
            </p> ${continue_space}`,

            `<p>Use the 1-7 number keys to select your choice.
            </p> ${continue_space}`,
        ]
    };

    timeline.push(instructions);

    let trial_number = 1;
    let images = [];
    let num_trials = trials.length;

    // Pushes each audio trial to timeline
    _.forEach(trials, (trial) => {

        images.push('stims/'+trial.pic1+'.jpg');
        images.push('stims/'+trial.pic2+'.jpg');
        
        // Empty Response Data to be sent to be collected
        let response = {
            subjCode: subjCode,
            workerId: workerId,
            assignmentId: assignmentId,
            hitId: hitId,
            pic1: trial.pic1,
            pic2: trial.pic2,
            country1: trial.country1 || 'unspecified',
            country2: trial.country2 || 'unspecified',
            expTimer : -1,
            response: -1,
            trial_number: trial_number,
            rt: -1,
        }	

        let stimulus = /* html */`
        <canvas width="800px" height="25px" id="bar"></canvas>
        <script>
            var barCanvas = document.getElementById('bar');
            var barCtx = barCanvas.getContext('2d');
            barCtx.roundRect(0, 0, barCanvas.width, barCanvas.height, 20).stroke();
            barCtx.roundRect(0, 0, barCanvas.width*${trial_number/num_trials}, barCanvas.height, 20).fill();
        </script>
        <h5 style="text-align:center;">Trial ${trial_number} of ${num_trials}</h5>
        <div style="width:100%;position:absolute;">
            <div style="width:50%;text-align:center;float:left;">
                <img src="stims/${trial.pic1}.jpg" alt="${trial.pic1}" height="200px" align="middle" style="max-width:400px;"/> 
            </div>
            <div style="width:50%;text-align:center;float:left;">
                <img src="stims/${trial.pic2}.jpg" alt="${trial.pic2}" height="200px" align="middle" style="max-width:400px;width=50%;" />
            </div>
        </div>
        `;

        let prompt = /* html */`
        <div style="position:absolute;bottom:0;width:100%;">
        <h1 style="text-align:center;line-height:1.5;">How similar in appearance are these two drawings?</h1>
            <div id="container">
                <img id="scale" src="img/scale.jpg" width="100%" />
                <canvas id="canvas" width="800px" height="138.97px"></canvas>
            </div>
        </div>
        <script src="circles.js"></script>
        `;

        // Picture Trial
        let pictureTrial = {
            type: 'single-stim',
            is_html: true,
            choices: ['1', '2', '3', '4', '5', '6', '7'],

            stimulus: stimulus,

            prompt: prompt,

            on_finish: function (data) {
                response.response = String.fromCharCode(data.key_press);
                response.rt = data.rt;
                response.expTimer = data.time_elapsed / 1000;

                // POST response data to server
                $.ajax({
                    url: 'http://'+document.domain+':'+PORT+'/data',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(response),
                    success: function () {
                        console.log(response);
                    }
                })
            }
        }
        timeline.push(pictureTrial);

        // let subject view their choice
        let breakTrial = {
            type: 'single-stim',
            is_html: true,
            timing_response: 1000,
            response_ends_trial: false,

            stimulus: stimulus,

            prompt: function () { 
                return prompt + `
                    <script>
                        ctx.beginPath();
                        ctx.arc(xCoords[${response.response-1}],yCoord,15,0,2*Math.PI);
                        ctx.stroke();
                        ctx.fill();
                    </script>`
            }
        }
        timeline.push(breakTrial);

        trial_number++;
    })

    
    let demographicsTrial = {
        type: "surveyjs",
        questions: demographicsQuestions,
        on_finish: function(data) {
        const demographicsResponses = Object.entries(data.response).map(([question, response]) => ({
            subjCode, response, question,
        }));
        
        console.log(demographicsResponses);
        // POST demographics data to server
        $.ajax({
            url: "http://" + document.domain + ":" + PORT + "/demographics",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ subjCode, responses: demographicsResponses }),
            success: function() {}
        });

        let endmessage = `
                    <p class="lead">Thank you for participating! If you have any questions or comments, please email hroebuck@wisc.edu.</p>
                    
                    <h3>Debriefing </h3>
                    <p class="lead">
                    The purpose of this study is to see how people who experience their thoughts in different ways (e.g., more or less language-like)
                    include different elements in their drawings of common animals and objects. 
                    </p>
                    `;
        jsPsych.endExperiment(endmessage);
        }
    };
    timeline.push(demographicsTrial);


    let endmessage = `Thank you for participating! Your completion code is ${participantID}. Copy and paste this in 
        MTurk to get paid. If you have any questions or comments, please email jsulik@wisc.edu.`

    // add scale pic paths to images that need to be loaded
    images.push('img/scale.png');
    for (let i = 1; i <= 7; i++)
        images.push('img/scale'+i+'.jpg');

    jsPsych.pluginAPI.preloadImages(images, function(){ startExperiment(); });

    function startExperiment() {
        jsPsych.init({
            default_iti: 0,
            timeline: timeline,
            fullscreen: FULLSCREEN,
            show_progress_bar: true,
            on_finish: function (data) {
                jsPsych.endExperiment(endmessage);
            }
        });
    }
}