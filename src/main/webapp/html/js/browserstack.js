
var registerUrl = "/register";
var submitUrl = "/submit";
var getTaskUrl = "/getTask";
var taskResponseUrl = "/taskResponse";
var getResultUrl = "/getResult";

var nodeId;
var jobId;
var sequence;


function bootAsNode() {
	log("Registering client...");
	register();
	pollTask();
}

function bootAsMaster() {
	pollResult();
}

function register() {
	$.get(registerUrl, function(data) {
		nodeId = data.nodeId;
		log("Node registration id: " + nodeId);
	});
}

function pollTask() {
    setTimeout(function(){
        $.get(getTaskUrl, function(task) {
            if(task.jobId) {
                onTaskReceived(task);
            }
        });
        pollTask();
    }, 3000);
}

function pollResult() {
    setTimeout(function(){
        $.get(getResultUrl, function(result) {
            $('textarea[name="result"]').text('');
            if(result) {
                $('textarea[name="result"]').text(result);
            }
        });
        pollResult();
    }, 3000);
}

function onTaskReceived(task) {
	var script = task.script;
	var data = task.data;
	jobId = task.jobId;
	sequence = task.sequence;
	log("Task received: {JobID: " + task.jobId + ", Sequence: " + task.sequence + "}.");

    log("Task execution started...");
	var dynamicScript =  'var data = ' + data + ';' + script;
	eval(dynamicScript);
	log("Task execution completed...");
	// To make node available
	register();
}

function sendResponse(response) {
    var data =  {
        'jobId': jobId,
        'sequence': sequence,
        'response': response
    };
    $.ajax({
            type: "POST",
            url: taskResponseUrl,
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8'
        });
}

function log(message) {
	$('textarea[name="console"').append("[" + formatDate(new Date()) + "] " + message);
	$('textarea[name="console"').append("\n");
}

function clearConsole() {
	$('textarea[name="console"]').text('');
}

function submitTask() {
	var data = {
        'name': $('input[name="jobName"').val(),
        'mapperScript': $('textarea[name="taskcode"').val(),
        'reducerScript': $('textarea[name="reducecode"').val(),
        'data': $('textarea[name="inputdata"').val()
    };
    $.ajax({
        type: "POST",
        url: submitUrl,
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8'
    });
}

function formatDate(date) {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + strTime;
}

