/*
 * Example plugin template
 */

jsPsych.plugins["surveyjs"] = (function () {

	var plugin = {};

	plugin.info = {
		name: "surveyjs",
		parameters: {
			questions: {
				// type: jsPsych.plugins.parameterType, // INT, IMAGE, KEYCODE, STRING, FUNCTION, FLOAT
				default_value: []
			}
		}
	}

	plugin.trial = function (display_element, trial) {

		display_element.append(`<div  class="survey">
	  <div id="surveyElement"></div>
  </div>`);
		let survey = new Survey.Model({
			questions: trial.questions
		});

		survey.onComplete.add(function (result) {
			demographicsResponses = result.data;
			$('#surveyComplete').remove();
			$('#cmplt').css('display', 'inherit');
			// end trial
			jsPsych.finishTrial({
				response: demographicsResponses
			});
		});

		$("#surveyElement").Survey({
			model: survey
		});
		survey.showCompletedPage = false;

	};

	return plugin;
})();