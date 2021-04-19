const canvas = document.querySelector('canvas');
canvas.width = 650;
canvas.height = 400;

const cellCanvas = canvas.getContext('2d');
var Nx = canvas.width / 10;
var Ny = canvas.height / 10;
var simulationRunning = false;

var stopIndex = 0;
var steps = 1000;
var sleepTime = 50;
var concentration = 0;

var array = [];
var arrayOld = [];
var stay = [0, 0, 0, 0, 0, 0, 0, 0, 0];
var born = [0, 0, 0, 0, 0, 0, 0, 0, 0];

var xVal = 0;
var yVal = concentration; 
var dataLength = 100;

var alivePoints = [];
var deadPoints = [];

var chart = new CanvasJS.Chart("chartContainer", 
{
	title:
	{
		text: "Concentration"
	},
	legend:
	{
		cursor: "pointer",
		verticalAlign: "top",
		fontSize: 22,
		fontColor: "dimGrey"
	},
	data: [
	{
		type: "line",
		dataPoints: alivePoints,
		showInLegend: true,
		name: "Alive",
		color: "#34EB74",
		lineThickness: 5
	},
	{
		type: "line",
		dataPoints: deadPoints,
		showInLegend: true,
		name: "Dead",
		color: "black",
		lineThickness: 5
	}],
	axisY: 
	{
		minimum: 0,
		maximum: 1
	}
});

function fill()
{
	cellCanvas.clearRect(0, 0, canvas.width, canvas.height);
	
	for (let i = 0; i < Nx; i++)
	{
		for (let j = 0; j < Ny; j++)
		{
			cellCanvas.fillStyle = array[i][j] == 0 ? 'green' : 'black'
			cellCanvas.fillRect(i*10,j*10, 10, 10);
			
		}
	}
}

function initArray()
{	
	array = []
	concentration = parseFloat(document.getElementById('spinBox').value, 10) / 100;

	for (let i = 0; i < Nx; i++)
	{
		var row = [];
		
		for (let j = 0; j < Ny; j++)
		{
			
			if ((Math.random()) >= concentration)
			{
				row.push(0);
			}
			else
			{
				row.push(1);
			}
		}
		
		array.push(row);
	}

	fill();
}

document.getElementById("stopButton").disabled = true;
initArray();
chart.render();

function neighborsSum(i, j)
{
	var sum = 0;
	var x = parseInt(Nx,10)
	var y = parseInt(Ny,10)

	sum = sum + arrayOld[(i + x - 1) % x][(j + y - 1) % y];
	sum = sum + arrayOld[(i + x - 1) % x][(j + y) % y];
	sum = sum + arrayOld[(i + x - 1) % x][(j + y + 1) % y];
	
	sum = sum + arrayOld[(i + x) % x][(j + y - 1) % y];
	sum = sum + arrayOld[(i + x) % x][(j + y + 1) % y];

	sum = sum + arrayOld[(i + x + 1) % x][(j + y - 1) % y];
	sum = sum + arrayOld[(i + x + 1) % x][(j + y) % y];
	sum = sum + arrayOld[(i + x + 1) % x][(j + y + 1) % y];
	
	return sum;
}

function bornRule(sum)
{
	if (born[0] == 1)
	{
		return false;
	}
	
	var change = false;
	
	for (var i = 1; i < 9; i++)
	{
		if (born[i] == 1 && sum == i)
		{
			change = true;
		}
	}
	
	return change;
}

function stayRule(sum)
{
	if (stay[0] == 1)
	{
		return false;
	}
	
	var change = false;
	
	for (var i = 1; i < 9; i++)
	{
		if (stay[i] == 1 && sum == i)
		{
			change = true;
		}
	}
	
	return change;
}

function nextState()
{
	arrayOld = [];
	
	for (let i = 0; i < Nx; i++)
	{	
		row = [];
		for (let j = 0; j < Ny; j++)
		{
			row.push(array[i][j]);
		}
		
		arrayOld.push(row);
	}
	
	for (let i = 0; i < Nx; i++)
	{	
		for (let j = 0; j < Ny; j++)
		{
			var sum = neighborsSum(i,j);
			var state = array[i][j];
			
			if (array[i][j] == 0 && bornRule(sum) == true)
			{
				array[i][j] = 1;
			}
			else
			{
				if (stayRule(sum) == false)
				{
					array[i][j] = 0;
				}	
			}
		}
	}
	
	fill();
}

function stayCheckBoxClicked(id)
{
	var checkBoxID = parseInt(id, 10);
	var checkBox = document.getElementById(checkBoxID == 0 ? "stayCheckSpace" : ("stayCheck" + id));
	
	if (checkBox.checked)
	{
		if (checkBoxID == 0)
		{
			for (var i = 1; i < 9; i++)
			{
				document.getElementById("stayCheck" + i.toString()).checked = false;
				stay[i] = 0;
			}
		}
		else
		{
			document.getElementById("stayCheckSpace").checked = false;
			stay[0] = 0;
		}
	}
	
	stay[checkBoxID] = checkBox.checked == true ? 1 : 0;
}

function bornCheckBoxClicked(id)
{
	var checkBoxID = parseInt(id, 10);
	var checkBox = document.getElementById(checkBoxID == 0 ? "bornCheckSpace" : ("bornCheck" + id));
	
	if (checkBox.checked)
	{
		if (checkBoxID == 0)
		{
			for (var i = 1; i < 9; i++)
			{
				document.getElementById("bornCheck" + i.toString()).checked = false;
				born[i] = 0;
			}
		}
		else
		{
			document.getElementById("bornCheckSpace").checked = false;
			born[0] = 0;
		}
	}
	
	born[checkBoxID] = checkBox.checked == true ? 1 : 0;
}

function sleep(ms)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}

function arrayConcentration()
{
	var sum = 0;
	for (let i = 0; i < Nx; i++)
	{	
		for (let j = 0; j < Ny; j++)
		{
			sum += array[i][j];
		}
	}
	
	return sum / (Nx * Ny);
}

var updateChart = function ()
{
	yVal = concentration;
	
	alivePoints.push(
	{
		x: xVal,
		y: yVal
	});
	
	deadPoints.push(
	{
		x: xVal,
		y: 1-yVal
	});
	
	xVal++;

	if (alivePoints.length > dataLength)
	{
		alivePoints.shift();
		deadPoints.shift();
	}

	chart.render();
};

async function startButtonClicked()
{
	if (simulationRunning == false)
	{
		document.getElementById("startButton").disabled = true;
		document.getElementById("stopButton").disabled = false;
		document.getElementById("restartButton").disabled = true;
		document.getElementById("saveButton").disabled = true;
		
		var progressBar = document.getElementById("progressBar");
		simulationRunning = true;
		var i;
		
		for (i = stopIndex; i < steps; i++)
		{ 
			progressBar.value = i + 1;

			if (simulationRunning == false)
			{
				stopIndex = i;
				break;
			}
			
			updateChart();
			nextState();
			concentration = arrayConcentration();
			
			await sleep(sleepTime);
		}
		
		if (i == steps)
		{
			stopIndex = 0;
			simulationRunning = false;
			document.getElementById("startButton").disabled = false;
			document.getElementById("stopButton").disabled = true;
			document.getElementById("restartButton").disabled = false;
			document.getElementById("saveButton").disabled = false;
		}
	}
}

function stopButtonClicked()
{
	var stopButton = document.getElementById("stopButton");

	if (simulationRunning == true)
	{
		stopButton.innerHTML = 'Continue'
		simulationRunning = false;
		document.getElementById("restartButton").disabled = false;
		document.getElementById("saveButton").disabled = false;
	}
	else
	{
		stopButton.innerHTML = 'Stop';
		startButtonClicked();
	}
}

function restartButtonClicked()
{
	document.getElementById("startButton").disabled = false;
	document.getElementById("stopButton").disabled = true;
	document.getElementById("restartButton").disabled = false;
	document.getElementById("saveButton").disabled = false;
	document.getElementById("stopButton").innerHTML = 'Stop';
	
	alivePoints = [];
	deadPoints = [];
	xVal = 0;
	chart.options.data[0].dataPoints = alivePoints;
	chart.options.data[1].dataPoints = deadPoints;
    chart.render();

	simulationRunning = false;
	stopIndex = 0;
	document.getElementById("progressBar").value = 0;

	initArray();
}
