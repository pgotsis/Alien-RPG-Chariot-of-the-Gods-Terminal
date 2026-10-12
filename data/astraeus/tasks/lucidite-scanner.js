////////////////////////////////////LUCIDITE SCANNER ///////////////////////////////////////////



var scannerFunction1 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 40px">SCANNER</div>\
		<div class="dataimage"></div>\
		<div class="datacontent">Scanner probes have already been deployed by Chief Engineer Holtz.  If any Lucidite is detected in nearby space the Computer will inform you. Listen for the Computer to tell you the sector of space and enter it on the right.\
		</div>\
		<div class="inputpad">\
	<button class="keypadbutton"  onClick="InputButton(\'A\');">A</button>\
	<button class="keypadbutton"  onClick="InputButton(\'B\');">B</button>\
	<button class="keypadbutton"  onClick="InputButton(\'C\');">C</button>\
	<button class="keypadbutton"  onClick="InputButton(\'D\');">D</button>\
	<button class="keypadbutton"  onClick="InputButton(\'E\');">E</button>\
	<button class="keypadbutton"  onClick="InputButton(\'F\');">F</button>\
	<button class="keypadbutton"  onClick="InputButton(\'G\');">G</button>\
	<button class="keypadbutton"  onClick="InputButton(\'H\');">H</button>\
	<button class="keypadbutton"  onClick="InputButton(\'I\');">I</button>\
	<button class="keypadbutton"  onClick="InputButton(\'J\');">J</button>\
	<button class="keypadbutton"  onClick="InputButton(\'K\');">K</button>\
	<button class="keypadbutton"  onClick="InputButton(\'L\');">L</button>\
	<button class="keypadbutton"  onClick="InputButton(\'M\');">M</button>\
	<button class="keypadbutton"  onClick="InputButton(\'N\');">N</button>\
	<button class="keypadbutton"  onClick="InputButton(\'O\');">O</button>\
	<button class="keypadbutton"  onClick="InputButton(\'P\');">P</button>\
	<button class="keypadbutton"  onClick="InputButton(\'Q\');">Q</button>\
	<button class="keypadbutton"  onClick="InputButton(\'R\');">R</button>\
	<button class="keypadbutton"  onClick="InputButton(\'S\');">S</button>\
	<button class="keypadbutton"  onClick="InputButton(\'T\');">T</button>\
	<button class="keypadbutton"  onClick="InputButton(\'U\');">U</button>\
	<button class="keypadbutton"  onClick="InputButton(\'V\');">V</button>\
	<button class="keypadbutton"  onClick="InputButton(\'W\');">W</button>\
	<button class="keypadbutton"  onClick="InputButton(\'X\');">X</button>\
	<button class="keypadbutton"  onClick="InputButton(\'Y\');">Y</button>\
	<button class="keypadbutton"  onClick="InputButton(\'Z\');">Z</button>\
	<button class="keypadbutton"  onClick="InputButton(\'-\');">-</button>\
	<br \><button class="keypadbutton"  onClick="InputButton(\'1\');">1</button>\
	<button class="keypadbutton"  onClick="InputButton(\'2\');">2</button>\
	<button class="keypadbutton"  onClick="InputButton(\'3\');">3</button>\
	<button class="keypadbutton"  onClick="InputButton(\'4\');">4</button>\
	<button class="keypadbutton"  onClick="InputButton(\'5\');">5</button>\
	<button class="keypadbutton"  onClick="InputButton(\'6\');">6</button>\
	<button class="keypadbutton"  onClick="InputButton(\'7\');">7</button>\
	<button class="keypadbutton"  onClick="InputButton(\'8\');">8</button>\
	<button class="keypadbutton"  onClick="InputButton(\'9\');">9</button>\
	<button class="keypadbutton"  onClick="InputButton(\'0\');">0</button>\
	<button class="keypadbutton"  onClick="ClearButton();">Clear</button>\
	<form id="question1"><input type="text" id="fname"></form>\
	<button class="keypadsubmit"  class="button" onclick="LuciditeCode()">Submit</button><p id="response"></p><p id="next"></p>\
	</div>';
	
				var scannerFunction2 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 40px">UV SCANNER</div>\
		<div class="dataimage"><img class="dataimg" src="images/astrorover1.png"></div>\
		<div class="datacontent">Ship scanners are unable to pinpoint the precise location of lucidite. You will need to deploy an Astro Rover to manually scan for lucidite.  The Astro Rover is equipped with a UV scanner that is used to detect lucidite in the exterior space surrounding the ship. Turn on this light.\
		<br /><br />The Astro Rover will require a power supply. Insert the power supply and the Astro Rover should light up. It will provide further instruction.\
		</div>\
		<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 500px" onclick="StartContent(\'scannerFunction5\');">Next</button>\
		</div>';
		
						var scannerFunction3 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 40px">UV SCANNER</div>\
		<div class="dataimage"><img class="dataimg" src="images/astrorover2.png"></div>\
		<div class="datacontent">The Astro Rover will require a power supply. Insert the power supply and the Astro Rover should light up.  Control the Astro Rover with the control pad.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'scannerFunction2\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'scannerFunction5\');">Next</button>';
		
				var scannerFunction4 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 40px">UV SCANNER</div>\
		<div class="dataimage"><img class="dataimg" src="images/cargocurtain1.png"></div>\
		<div class="datacontent">Follow the Astro Rover\'s audio instructions to input spatial coordinates.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'scannerFunction2\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'scannerFunction5\');">Next</button>';
		

					var scannerFunction5 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 40px">SCANNER</div>\
		<div class="dataimage"></div>\
		<div class="datacontent"> Follow the instructions provided by the Astro Rover. Enter spatial coordinates on the right to scan debris for lucidite.\
		</div>\
		<div class="inputpad">\
	<button class="keypadbutton"  onClick="InputButton(\'A\');">A</button>\
	<button class="keypadbutton"  onClick="InputButton(\'B\');">B</button>\
	<button class="keypadbutton"  onClick="InputButton(\'C\');">C</button>\
	<button class="keypadbutton"  onClick="InputButton(\'D\');">D</button>\
	<button class="keypadbutton"  onClick="InputButton(\'E\');">E</button>\
	<button class="keypadbutton"  onClick="InputButton(\'F\');">F</button>\
	<button class="keypadbutton"  onClick="InputButton(\'G\');">G</button>\
	<button class="keypadbutton"  onClick="InputButton(\'H\');">H</button>\
	<button class="keypadbutton"  onClick="InputButton(\'I\');">I</button>\
	<button class="keypadbutton"  onClick="InputButton(\'J\');">J</button>\
	<button class="keypadbutton"  onClick="InputButton(\'K\');">K</button>\
	<button class="keypadbutton"  onClick="InputButton(\'L\');">L</button>\
	<button class="keypadbutton"  onClick="InputButton(\'M\');">M</button>\
	<button class="keypadbutton"  onClick="InputButton(\'N\');">N</button>\
	<button class="keypadbutton"  onClick="InputButton(\'O\');">O</button>\
	<button class="keypadbutton"  onClick="InputButton(\'P\');">P</button>\
	<button class="keypadbutton"  onClick="InputButton(\'Q\');">Q</button>\
	<button class="keypadbutton"  onClick="InputButton(\'R\');">R</button>\
	<button class="keypadbutton"  onClick="InputButton(\'S\');">S</button>\
	<button class="keypadbutton"  onClick="InputButton(\'T\');">T</button>\
	<button class="keypadbutton"  onClick="InputButton(\'U\');">U</button>\
	<button class="keypadbutton"  onClick="InputButton(\'V\');">V</button>\
	<button class="keypadbutton"  onClick="InputButton(\'W\');">W</button>\
	<button class="keypadbutton"  onClick="InputButton(\'X\');">X</button>\
	<button class="keypadbutton"  onClick="InputButton(\'Y\');">Y</button>\
	<button class="keypadbutton"  onClick="InputButton(\'Z\');">Z</button>\
	<button class="keypadbutton"  onClick="InputButton(\'-\');">-</button>\
	<br \><button class="keypadbutton"  onClick="InputButton(\'1\');">1</button>\
	<button class="keypadbutton"  onClick="InputButton(\'2\');">2</button>\
	<button class="keypadbutton"  onClick="InputButton(\'3\');">3</button>\
	<button class="keypadbutton"  onClick="InputButton(\'4\');">4</button>\
	<button class="keypadbutton"  onClick="InputButton(\'5\');">5</button>\
	<button class="keypadbutton"  onClick="InputButton(\'6\');">6</button>\
	<button class="keypadbutton"  onClick="InputButton(\'7\');">7</button>\
	<button class="keypadbutton"  onClick="InputButton(\'8\');">8</button>\
	<button class="keypadbutton"  onClick="InputButton(\'9\');">9</button>\
	<button class="keypadbutton"  onClick="InputButton(\'0\');">0</button>\
	<button class="keypadbutton"  onClick="ClearButton();">Clear</button>\
	<form id="question1"><input type="text" id="fname"></form>\
	<button class="keypadsubmit"  class="button" onclick="SubmitCode()">Submit</button><p id="response"></p><p id="next"></p>\
	</div>\
			<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'scannerFunction2\');">Back</button>';
		
						var scannerFunction6 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 40px">UV SCANNER</div>\
		<div class="dataimage"><img class="dataimg" src="images/transmitterarray.png"></div>\
		<div class="datacontent">Lucidite has been detected in that object. Go to the transmitter array. Use the chroma keypad to change the lights to <font color="blue">blue</font>. Then turn the transmitter array around and press the <font color="blue">large round button</font>.\
		<br /><br />No more lucidite is detected in nearby space.\
		</div>';




/////////////////////////////////////////////////////////////////////////////////////////////////
