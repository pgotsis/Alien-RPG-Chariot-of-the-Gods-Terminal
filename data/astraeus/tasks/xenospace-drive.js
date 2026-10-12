
	/////////////////////////// XENOSPACE DRIVE ////////////////////////////////

	var nonogram = '\
		<button class="backbutton" onmousedown="playRandomSound()" style="left: 372px; width: 154px; height: 20px; top: 556px" onclick="StartContent(\'mainMenu\');">Main Menu</button>\
				<div class="datacontent" style="top: 10; width: 800">\
    <div id="puzzle-full" >\
        <section class="topkey">\
            <div class="cell"class="cell" id="c0r0"></div>\
            <div class="cell"id="c1r0">?</div>\
            <div class="cell"id="c2r0">?</div>\
            <div class="cell"id="c3r0">?</div>\
            <div class="cell"id="c4r0">?</div>\
            <div class="cell"id="c5r0">?</div>\
            <div class="cell"id="c6r0">?</div>\
            <div class="cell"id="c7r0">?</div>\
            <div class="cell"id="c8r0">?</div>\
            <div class="cell"id="c9r0">?</div>\
            <div class="cell"id="c10r0">?</div>\
            <div class="cell"id="c11r0" style="visibility: hidden;"></div>\
        </section>\
        <section id="puzzleboard";>\
            <div class="leftkey" id="c0r1"></div>\
            <div class="cell"id="c1r1" onclick="cellClick(this)">0</div>\
            <div class="cell"id="c2r1" onclick="cellClick(this)">0</div>\
            <div class="cell"id="c3r1" onclick="cellClick(this)">0</div>\
            <div class="cell"id="c4r1" onclick="cellClick(this)">0</div>\
            <div class="cell"id="c5r1" onclick="cellClick(this)">0</div>\
            <div class="cell"id="c6r1" onclick="cellClick(this)">0</div>\
            <div class="cell"id="c7r1" onclick="cellClick(this)">0</div>\
            <div class="cell"id="c8r1" onclick="cellClick(this)">0</div>\
            <div class="cell"id="c9r1" onclick="cellClick(this)">0</div>\
            <div class="cell"id="c10r1" onclick="cellClick(this)">0</div>\
            <div class="cell"id="c11r1" onclick="cellClick(this)" style="visibility: hidden;">0</div>\
\
            <div class="leftkey" id="c0r2"></div>\
            <div class="cell"id="c1r2"  onclick="cellClick(this)">1</div>\
            <div class="cell"id="c2r2" onclick="cellClick(this)">1</div>\
            <div class="cell"id="c3r2" onclick="cellClick(this)">1</div>\
            <div class="cell"id="c4r2" onclick="cellClick(this)">1</div>\
            <div class="cell"id="c5r2" onclick="cellClick(this)">1</div>\
            <div class="cell"id="c6r2" onclick="cellClick(this)">1</div>\
            <div class="cell"id="c7r2" onclick="cellClick(this)">1</div>\
            <div class="cell"id="c8r2" onclick="cellClick(this)">1</div>\
            <div class="cell"id="c9r2" onclick="cellClick(this)">1</div>\
            <div class="cell"id="c10r2" onclick="cellClick(this)">1</div>\
            <div class="cell"id="c11r2" onclick="cellClick(this)" style="visibility: hidden;">1</div>\
\
            <div class="leftkey" id="c0r3"></div>\
            <div class="cell"id="c1r3"   onclick="cellClick(this)">2</div>\
            <div class="cell"id="c2r3" onclick="cellClick(this)">2</div>\
            <div class="cell"id="c3r3" onclick="cellClick(this)">2</div>\
            <div class="cell"id="c4r3" onclick="cellClick(this)">2</div>\
            <div class="cell"id="c5r3" onclick="cellClick(this)">2</div>\
            <div class="cell"id="c6r3" onclick="cellClick(this)">2</div>\
            <div class="cell"id="c7r3" onclick="cellClick(this)">2</div>\
            <div class="cell"id="c8r3" onclick="cellClick(this)">2</div>\
            <div class="cell"id="c9r3" onclick="cellClick(this)">2</div>\
            <div class="cell"id="c10r3" onclick="cellClick(this)">2</div>\
            <div class="cell"id="c11r3" onclick="cellClick(this)" style="visibility: hidden;">2</div>\
\
            <div class="leftkey" id="c0r4"></div>\
            <div class="cell"id="c1r4"   onclick="cellClick(this)">3</div>\
            <div class="cell"id="c2r4" onclick="cellClick(this)">3</div>\
            <div class="cell"id="c3r4" onclick="cellClick(this)">3</div>\
            <div class="cell"id="c4r4" onclick="cellClick(this)">3</div>\
            <div class="cell"id="c5r4" onclick="cellClick(this)">3</div>\
            <div class="cell"id="c6r4" onclick="cellClick(this)">3</div>\
            <div class="cell"id="c7r4" onclick="cellClick(this)">3</div>\
            <div class="cell"id="c8r4" onclick="cellClick(this)">3</div>\
            <div class="cell"id="c9r4" onclick="cellClick(this)">3</div>\
            <div class="cell"id="c10r4" onclick="cellClick(this)">3</div>\
            <div class="cell"id="c11r4" onclick="cellClick(this)" style="visibility: hidden;">3</div>\
\
            <div class="leftkey" id="c0r5"></div>\
            <div class="cell"id="c1r5"  onclick="cellClick(this)">4</div>\
            <div class="cell"id="c2r5" onclick="cellClick(this)">4</div>\
            <div class="cell"id="c3r5" onclick="cellClick(this)">4</div>\
            <div class="cell"id="c4r5" onclick="cellClick(this)">4</div>\
            <div class="cell"id="c5r5" onclick="cellClick(this)">4</div>\
            <div class="cell"id="c6r5" onclick="cellClick(this)">4</div>\
            <div class="cell"id="c7r5" onclick="cellClick(this)">4</div>\
            <div class="cell"id="c8r5" onclick="cellClick(this)">4</div>\
            <div class="cell"id="c9r5" onclick="cellClick(this)">4</div>\
            <div class="cell"id="c10r5" onclick="cellClick(this)">4</div>\
            <div class="cell"id="c11r5" onclick="cellClick(this)" style="visibility: hidden;">4</div>\
\
            <div class="leftkey" id="c0r6"></div>\
            <div class="cell"id="c1r6"  onclick="cellClick(this)">5</div>\
            <div class="cell"id="c2r6" onclick="cellClick(this)">5</div>\
            <div class="cell"id="c3r6" onclick="cellClick(this)">5</div>\
            <div class="cell"id="c4r6" onclick="cellClick(this)">5</div>\
            <div class="cell"id="c5r6" onclick="cellClick(this)">5</div>\
            <div class="cell"id="c6r6" onclick="cellClick(this)">5</div>\
            <div class="cell"id="c7r6" onclick="cellClick(this)">5</div>\
            <div class="cell"id="c8r6" onclick="cellClick(this)">5</div>\
            <div class="cell"id="c9r6" onclick="cellClick(this)">5</div>\
            <div class="cell"id="c10r6" onclick="cellClick(this)">5</div>\
            <div class="cell"id="c11r6" onclick="cellClick(this)" style="visibility: hidden;">5</div>\
\
            <div class="leftkey" id="c0r7"></div>\
            <div class="cell"id="c1r7"  onclick="cellClick(this)">6</div>\
            <div class="cell"id="c2r7" onclick="cellClick(this)">6</div>\
            <div class="cell"id="c3r7" onclick="cellClick(this)">6</div>\
            <div class="cell"id="c4r7" onclick="cellClick(this)">6</div>\
            <div class="cell"id="c5r7" onclick="cellClick(this)">6</div>\
            <div class="cell"id="c6r7" onclick="cellClick(this)">6</div>\
            <div class="cell"id="c7r7" onclick="cellClick(this)">6</div>\
            <div class="cell"id="c8r7" onclick="cellClick(this)">6</div>\
            <div class="cell"id="c9r7" onclick="cellClick(this)">6</div>\
            <div class="cell"id="c10r7" onclick="cellClick(this)">6</div>\
            <div class="cell"id="c11r7" onclick="cellClick(this)" style="visibility: hidden;">6</div>\
\
            <div class="leftkey" id="c0r8"></div>\
            <div class="cell"id="c1r8"  onclick="cellClick(this)">7</div>\
            <div class="cell"id="c2r8" onclick="cellClick(this)">7</div>\
            <div class="cell"id="c3r8" onclick="cellClick(this)">7</div>\
            <div class="cell"id="c4r8" onclick="cellClick(this)">7</div>\
            <div class="cell"id="c5r8" onclick="cellClick(this)">7</div>\
            <div class="cell"id="c6r8" onclick="cellClick(this)">7</div>\
            <div class="cell"id="c7r8" onclick="cellClick(this)">7</div>\
            <div class="cell"id="c8r8" onclick="cellClick(this)">7</div>\
            <div class="cell"id="c9r8" onclick="cellClick(this)">7</div>\
            <div class="cell"id="c10r8" onclick="cellClick(this)">7</div>\
            <div class="cell"id="c11r8" onclick="cellClick(this)" style="visibility: hidden;">7</div>\
\
            <div class="leftkey" id="c0r9"></div>\
            <div class="cell"id="c1r9"  onclick="cellClick(this)">8</div>\
            <div class="cell"id="c2r9" onclick="cellClick(this)">8</div>\
            <div class="cell"id="c3r9" onclick="cellClick(this)">8</div>\
            <div class="cell"id="c4r9" onclick="cellClick(this)">8</div>\
            <div class="cell"id="c5r9" onclick="cellClick(this)">8</div>\
            <div class="cell"id="c6r9" onclick="cellClick(this)">8</div>\
            <div class="cell"id="c7r9" onclick="cellClick(this)">8</div>\
            <div class="cell"id="c8r9" onclick="cellClick(this)">8</div>\
            <div class="cell"id="c9r9" onclick="cellClick(this)">8</div>\
            <div class="cell"id="c10r9" onclick="cellClick(this)">8</div>\
            <div class="cell"id="c11r9" onclick="cellClick(this)" style="visibility: hidden;">8</div>\
\
            <div class="leftkey" id="c0r10"></div>\
            <div class="cell"id="c1r10"  onclick="cellClick(this)">9</div>\
            <div class="cell"id="c2r10" onclick="cellClick(this)">9</div>\
            <div class="cell"id="c3r10" onclick="cellClick(this)">9</div>\
            <div class="cell"id="c4r10" onclick="cellClick(this)">9</div>\
            <div class="cell"id="c5r10" onclick="cellClick(this)">9</div>\
            <div class="cell"id="c6r10" onclick="cellClick(this)">9</div>\
            <div class="cell"id="c7r10" onclick="cellClick(this)">9</div>\
            <div class="cell"id="c8r10" onclick="cellClick(this)">9</div>\
            <div class="cell"id="c9r10" onclick="cellClick(this)">9</div>\
            <div class="cell"id="c10r10" onclick="cellClick(this)">9</div>\
            <div class="cell"id="c11r10" onclick="cellClick(this)" style="visibility: hidden;">9</div>\
\
            <div class="leftkey" id="c0r11" style="visibility: hidden;"></div>\
            <div class="cell"id="c1r11"  onclick="cellClick(this)">10</div>\
            <div class="cell"id="c2r11" onclick="cellClick(this)">10</div>\
            <div class="cell"id="c3r11" onclick="cellClick(this)">10</div>\
            <div class="cell"id="c4r11" onclick="cellClick(this)">10</div>\
            <div class="cell"id="c5r11" onclick="cellClick(this)">10</div>\
            <div class="cell"id="c6r11" onclick="cellClick(this)">10</div>\
            <div class="cell"id="c7r11" onclick="cellClick(this)">10</div>\
            <div class="cell"id="c8r11" onclick="cellClick(this)">10</div>\
            <div class="cell"id="c9r11" onclick="cellClick(this)">10</div>\
            <div class="cell"id="c10r11" onclick="cellClick(this)">10</div>\
            <div class="cell"id="c11r11" onclick="cellClick(this)" style="visibility: hidden;">10</div>\
        </section>\
	</div>\
	<button class="nextbutton" id="submitHorizontal" style="position: absolute; top: 0; left: 440" onclick="submitHorizontalRow();">Submit</button>\
	<button class="nextbutton" id="submitVertical" style="visibility: hidden; position: absolute; top: 440; left: 0" onclick="submitVerticalColumn();">Submit</button>\
	<div id="createConfigurations" style="position: absolute; top: 350; left: 490;">\
		<div style="text-align: center; font-size: 15;">\
			Select a configuration to update:\
		</div>\
		<div class="row">\
			<div id="configurationOne" class="configCell" onclick="LoadPuzzle(this, 0)" style="background-image: url(images/setRowCell.png);"); border-color: yellow;"></div>\
			<div id="configurationTwo" class="configCell" onclick="LoadPuzzle(this, 1)" style="background-image: url(images/setRowCell.png);"); "></div>\
			<div id="configurationThree" class="configCell" onclick="LoadPuzzle(this, 2)" style="background-image: url(images/setRowCell.png);"); "></div>\
			<div id="configurationFour" class="configCell" onclick="LoadPuzzle(this, 3)" style="background-image: url(images/setRowCell.png);"); "></div>\
		</div>\
	</div>\
	<div id="colorPicker" style="visibility: hidden; position: absolute; top: 100; left: 150;">\
		<div style="text-align: center">\
		Select the color <br>for these coordinates.\
		</div>\
		<div class="row">\
			<div id="red" class="colorCell" onclick="changeColorCell(this)" style="background-color: red"></div>\
			<div id="silver" class="colorCell" onclick="changeColorCell(this)" style="background-color: silver"></div>\
			<div id="green" class="colorCell" onclick="changeColorCell(this)" style="background-color: green"></div>\
		</div>\
		<div  class="row">\
			<div id="orange" class="colorCell" onclick="changeColorCell(this)" style="background-color: orange"></div>\
			<div id="yellow" class="colorCell" onclick="changeColorCell(this)" style="background-color: yellow"></div>\
			<div id="purple" class="colorCell" onclick="changeColorCell(this)" style="background-color: purple"></div>\
		</div>\
		<div  class="row">\
			<div id="aqua" class="colorCell" onclick="changeColorCell(this)" style="background-color: aqua"></div>\
			<div id="blue" class="colorCell" onclick="changeColorCell(this)" style="background-color: blue"></div>\
			<div id="pink" class="colorCell" onclick="changeColorCell(this)" style="background-color: pink"></div>\
		</div>\
		<button class="greenbutton databutton" style="position: absolute; top: 240px; left: -9;" id="submitColor" onclick="submitColor();">Submit</button>\
	</div>\
	<div id="configurationComplete" style="visibility: visible; position: absolute; top: 100; left: 500; font-size: 20;">\
		Set Row Input.\
	</div>\
	<div id="posneg" style="visibility: hidden";>\
		<div id="configurationComplete" style="position: absolute; top: 80; left: 500; font-size: 15; text-align: center;">\
		\</div>\
		<img style="position: absolute; top: 120; left: 500;" onclick="changePos()"; id="pos" src="images/greenPosSelected.png">\
		<img style="position: absolute; top: 170; left: 500;" onclick="changeNeg()" id="neg" src="images/negUnselected.png">\
	</div>\
	<div id="showMistakes" style="visibility: hidden;">\
		<button class="backbutton" onmousedown="playRandomSound()"  onclick="showMistakes();" style="left: 550px; width: 154px; height: 20px; top: 250px;">Count Mistakes</button>\
		<div id="mistakesCount" style="position: absolute; left: 710px; top: 245px; font-size: 20px"></div>\
	</div>\
	<button id="clearGrid" class="backbutton" onmousedown="playRandomSound()" style="visibility: hidden; left: 550px; width: 154px; height: 20px; top: 300px" onclick="clearGrid();">Clear Grid</button>\
	<div id="instructions">\
        <p id="instructions-text">\
        click to fill in cells. option + click to mark squares pink.\
        <br> \
        <br> \
        numbers above correspond to columns, left to rows. \
        numerical value indicates contiguously shaded cells. \
        for example, "10" indicates a group of 10 shaded cells. \
        <br> \
        <br> \
		show example of 8 down then 2 across with negative the helps with 5 down \
        the amount of contiguous empty cells is not given. \
        therefore, consider all configurations for that value. \
        for example, "4 4" has three potential configurations. \
        one:[xxxx--xxxx], two:[-xxxx-xxxx], three:[xxxx-xxxx-].\
        logically, shaded cells overlap at points of certainty. \
        we deduce that the cells [-xxx--xxx-] must be shaded.\
        <br> \
        <br> \
        to solve, continue deducing until all values satisfied.\
        </p>\
    </div>\
		</div>\
	';
	
	
	
	
	var puzzleCompletion = ["changeHorizontal", "changeHorizontal", "changeHorizontal", "changeHorizontal"]; 
	var puzzleColors = ["None", "None", "None", "None"];
	
	
	const orangeHorizontalCheat = "5.5.5.5.5.5.5.5.5.5.";
	const orangeVerticalCheat =   "5.5.5.5.5.5.5.5.5.5.";
	
	const orangeHorizontal = "0.1.3.5.8.10.8.3.2.2.";
	const blueHorizontal =  "1.2.6.9.9.8.6.4.2.1.";
	const greenHorizontal = "1.3.5.8.5.6.5.5.2.1."
	const purpleHorizontal ="0.1.2.5.9.10.9.4.3.0."
	
	const orangeVertical = "2.2.3.4.6.8.6.5.3.3.";
	const blueVertical =   "0.3.5.6.8.7.8.5.3.3.";
	const greenVertical =  "0.2.2.3.5.9.7.5.5.3.";
	const purpleVertical = "1.3.3.3.5.6.6.8.5.3.";
	
	
	var orangeHorizontalCurrent = "?.?.?.?.?.?.?.?.?.?.";
	var blueHorizontalCurrent = "?.?.?.?.?.?.?.?.?.?.";
	var greenHorizontalCurrent = "?.?.?.?.?.?.?.?.?.?.";
	var purpleHorizontalCurrent = "?.?.?.?.?.?.?.?.?.?.";
	
	
	var orangeVerticalCurrent = "?.?.?.?.?.?.?.?.?.?.";
	var blueVerticalCurrent = "?.?.?.?.?.?.?.?.?.?.";
	var greenVerticalCurrent = "?.?.?.?.?.?.?.?.?.?.";
	var purpleVerticalCurrent = "?.?.?.?.?.?.?.?.?.?.";
	
	
	const orangeColorSolution = "orange";
	const blueColorSolution = "blue";
	const greenColorSolution = "green";
	const purpleColorSolution = "purple";
	
	
	const orangeColorCurrent = "none";
	const blueColorCurrent = "none";
	const greenColorCurrent = "none";
	const purpleColorCurrent = "none";
	
	function GetVerticalSolution() {
		switch(puzzleColors[currentPuzzle])
		{
			case "orange":
				return orangeVertical
			case "blue":
				return blueVertical
			case "green":
				return greenVertical
			case "purple":
				return purpleVertical
			break;
		}
	}
	
	function GetHorizontalSolution() {
		switch(puzzleColors[currentPuzzle])
		{
			case "orange":
				return orangeHorizontal
			case "blue":
				return blueHorizontal
			case "green":
				return greenHorizontal
			case "purple":
				return purpleVertical
			break;
		}
	}
	
	function GetColorSolution() {
		switch(puzzleColors[currentPuzzle])
		{
			case "orange":
				return orangeColorSolution
			case "blue":
				return blueColorSolution
			case "green":
				return greenColorSolution
			case "purple":
				return purpleColorSolution
			break;
		}
	}
	
	function GetBoardSolution() {
		switch(puzzleColors[currentPuzzle])
		{
			case "orange":
				return solutionOrange;
			case "blue":
				return solutionBlue;
			case "green":
				return solutionGreen;
			case "purple":
				return solutionPurple;
			break;
		}
	}
	
	
	
		function GetVerticalCurrent() {
		switch(puzzleColors[currentPuzzle])
		{
			case "orange":
				return orangeVerticalCurrent;
			case "blue":
				return blueVerticalCurrent;
			case "green":
				return greenVerticalCurrent;
			case "purple":
				return purpleVerticalCurrent;
			break;
		}
	}
	
	function GetHorizontalCurrent() {
		switch(currentPuzzle)
		{
			case 0:
				return horizon;
			case 1:
				return blueHorizontalCurrent;
			case 2:
				return greenHorizontalCurrent;
			case 3:
				return purpleVerticalCurrent;
			break;
		}
	}
	
	function GetColorCurrent() {
		switch(puzzleColors[currentPuzzle])
		{
			case "orange":
				return orangeColorCurrent;
			case "blue":
				return blueColorCurrent;
			case "green":
				return greenColorCurrent;
			case "purple":
				return purpleColorCurrent;
			break;
		}
	}
	
	function GetBoardCurrent() {
		switch(puzzleColors[currentPuzzle])
		{
			case "orange":
				return currentOrangeBoard;
			case "blue":
				return currentBlueBoard;
			case "green":
				return currentGreenBoard;
			case "purple":
				return currentPurpleBoard;
			break;
		}
	}
	
	function SaveBoardCurrent(newBoard) {
		switch(puzzleColors[currentPuzzle])
		{
			case "orange":
				currentOrangeBoard = newBoard;
			case "blue":
				 currentBlueBoard = newBoard;
			case "green":
				 currentGreeneBoard = newBoard;
			case "purple":
				 currentPurpleBoard = newBoard;
			break;
		}
	}
	
	function GetBlockColor()
	{
		switch(puzzleColors[currentPuzzle])
		{
			case "orange":
				return orangeColorSolution
			case "blue":
				return blueColorSolution
			case "green":
				return greenColorSolution
			case "purple":
				return purpleColorSolution
			break;
		}
	}
	
	
	function GetPos()
	{
		if(PositiveTap == true)
			return GetPosImage();
		else
			return GetPosUnselected();
	}
	
	function GetPosImage()
	{
		switch(puzzleColors[currentPuzzle])
		{
			case "orange":
				return "images/orangePosSelected.png";
			case "blue":
				return "images/bluePosSelected.png";
			case "green":
				return "images/greenPosSelected.png";
			case "purple":
				return "images/purplePosSelected.png";
			break;
		}
	}
	
	function GetPosUnselected()
	{
		switch(puzzleColors[currentPuzzle])
		{
			case "orange":
				return "images/orangePosUnselected.png";
			case "blue":
				return "images/bluePosUnselected.png";
			case "green":
				return "images/greenPosUnselected.png";
			case "purple":
				return "images/purplePosUnselected.png";
			break;
		}
	}
	
  
const solutionOrange = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 0
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0], // column 1
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0], // column 2
    [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], // column 3
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0], // column 4
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], // column 5
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1], // column 6
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0], // column 7
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0], // column 8
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0], // column 9
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0] // column 00
  ];
  const solutionBlue = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 1
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0], // column 2
        [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0], // column 3
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0], // column 4
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0], // column 5
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0], // column 6
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1], // column 7
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0], // column 8
        [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0], // column 9
        [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0]  // column 10
  ];
  const solutionGreen = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 1
        [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0], // column 2
        [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0], // column 3
        [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0], // column 4
        [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0], // column 5
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // column 6
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1], // column 7
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0], // column 8
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0], // column 9
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0]  // column 10
  ];
  const solutionPurple = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0], // column 1
        [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], // column 2
        [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], // column 3
        [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0], // column 4
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0], // column 5
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0], // column 6
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0], // column 7
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0], // column 8
        [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0], // column 9
        [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0]  // column 10
  ];
	
	var currentOrangeBoard = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 1
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 2
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 3
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 4
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 5
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 6
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 7
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 8
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 9
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // column 10
    ];
	var currentBlueBoard = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 1
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 2
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 3
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 4
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 5
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 6
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 7
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 8
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 9
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // column 10
    ];
	var currentGreenBoard = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 1
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 2
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 3
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 4
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 5
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 6
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 7
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 8
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 9
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // column 10
    ];
	var currentPurpleBoard = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 1
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 2
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 3
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 4
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 5
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 6
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 7
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 8
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 9
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // column 10
    ];
	
		const boardCheat = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 1
        [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], // column 2
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 3
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 4
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 5
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 6
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 7
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 8
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], // column 9
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // column 10
    ];
	
			const boardEmpty = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 1
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 2
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 3
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 4
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 5
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 6
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 7
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 8
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 9
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // column 10
    ];
	
	
	
	function SetColorFromHorizontal(horCurrent) {
		
		
		if(horCurrent == orangeHorizontal)
		{
			puzzleColors[currentPuzzle] = "orange";
		}
		else if(horCurrent == blueHorizontal)
		{
			puzzleColors[currentPuzzle] = "blue";
		}
		else if(horCurrent == greenHorizontal)
		{
			puzzleColors[currentPuzzle] = "green";
		}
		else if(horCurrent == purpleHorizontal)
		{
			puzzleColors[currentPuzzle] = "purple";
		}
		else
		{
			//error
		}
	}
	
	
	function HorizonalAlreadyUsed(horCurrent) {
		
		
		if(horCurrent == orangeHorizontal)
		{
			return puzzleColors.includes("orange");			
		}
		else if(horCurrent == blueHorizontal)
		{
			return puzzleColors.includes("blue");		
		}
		else if(horCurrent == greenHorizontal)
		{
			return puzzleColors.includes("green");		
		}
		else if(horCurrent == purpleHorizontal)
		{
			return puzzleColors.includes("purple");		
		}
		else
		{
			//error
			return false;
		}
	}
	
	var currentPuzzle = 0;
	
	
	var PuzzleAHorizontal = "0.1.3.5.8.10.8.3.2.2.";
	var PuzzleAVertical = "2.2.3.4.6.8.6.5.3.3.";
	var PuzzleQuestions = "?.?.?.?.?.?.?.?.?.?.";
	var PuzzleEmpty = " . . . . . . . . . .";


	
	
	function LoadPuzzle(configCell, puzNum)
	{
		currentPuzzle = puzNum;
		
		changePhase(puzzleCompletion[currentPuzzle]);		
		
		var configCells = document.getElementsByClassName("configCell");
		for (var i = 0; i < configCells.length; i++) {
			configCells.item(i).style.borderColor = "grey";
		}
		
		configCell.style.borderColor = "yellow";
	}
	
	
	
	function LoadDirections()
	{
		switch(puzzleCompletion[currentPuzzle])
		{
			case "changeHorizontal":
				return "Set Row Input";
			case "changeVertical":
				return "Set column input";
			case "changeColor":
				return "Set color for this row and column";
			case "changePuzzle":
				return "Build the configuration.";
			case "finished":
				var message = "This configuration complete.  ";
				
				var incompleteCount = 0;
				
				if(puzzleCompletion[0] != "finished")
					incompleteCount++;
				if(puzzleCompletion[1] != "finished")
					incompleteCount++;
				if(puzzleCompletion[2] != "finished")
					incompleteCount++;
				if(puzzleCompletion[3] != "finished")
					incompleteCount++;
				
				if(incompleteCount == 0)
					message = "All configurations complete";
				else
					message += incompleteCount + " configurations remain.";
				
				return message;
				
				
				break;
			
		}
		
	}
	
	
	
	function changePhase(newPhase)
	{
		NoStyling();
		switch(newPhase)
		{
			case "changeHorizontal":		
				removeAllInputs();
				changeSideColumn(PuzzleEmpty);
				revealFinalRow();
				hideFinalColumn();
				changeTopRow(PuzzleQuestions);
				setHorizontalInputs();
				
				//fix borders
				SetLeftRightBorders();
				
				document.getElementById("clearGrid").style.visibility = "hidden";
				document.getElementById("showMistakes").style.visibility = "hidden";
				document.getElementById("submitHorizontal").style.visibility = "visible";
				document.getElementById("submitVertical").style.visibility = "hidden";		
				document.getElementById("posneg").style.visibility = "hidden";
				document.getElementById("colorPicker").style.visibility = "hidden";	
				document.getElementById("configurationComplete").innerHTML = LoadDirections();
				break;
			case "changeVertical":			
				removeAllInputs();
				changeTopRow(GetHorizontalSolution());
				revealFinalColumn();
				hideFinalRow();
				changeSideColumn(PuzzleQuestions);	
				setVerticalInputs();
				
				//fix borders
				
				SetTopBottomBorders();
				document.getElementById("clearGrid").style.visibility = "hidden";
				document.getElementById("showMistakes").style.visibility = "hidden";
				document.getElementById("submitHorizontal").style.visibility = "hidden";
				document.getElementById("submitVertical").style.visibility = "visible";				
				document.getElementById("posneg").style.visibility = "hidden";
				document.getElementById("colorPicker").style.visibility = "hidden";	
				document.getElementById("configurationComplete").innerHTML = LoadDirections();
				break;
			case "changeColor":				
				removeAllInputs();
				hideFinalRow();
				hideFinalColumn();
				changeTopRow(GetHorizontalSolution());
				changeSideColumn(GetVerticalSolution());
				SetNoBorders();
				document.getElementById("clearGrid").style.visibility = "hidden";
				document.getElementById("showMistakes").style.visibility = "hidden";
				document.getElementById("posneg").style.visibility = "hidden";
				document.getElementById("submitHorizontal").style.visibility = "hidden";
				document.getElementById("submitVertical").style.visibility = "hidden";
				document.getElementById("colorPicker").style.visibility = "visible";	
				document.getElementById("configurationComplete").innerHTML = LoadDirections();
				break;
			case "changePuzzle":
				removeAllInputs();
				hideFinalRow();
				hideFinalColumn();
				changeTopRow(GetHorizontalSolution());
				changeSideColumn(GetVerticalSolution());
				LoadNono(GetBoardCurrent());
				SetPuzzleBorders();
				document.getElementById("clearGrid").style.visibility = "visible";
				document.getElementById("showMistakes").style.visibility = "visible";
				document.getElementById("posneg").style.visibility = "visible";
				document.getElementById("pos").src = GetPos();
				document.getElementById("submitHorizontal").style.visibility = "hidden";
				document.getElementById("submitVertical").style.visibility = "hidden";
				document.getElementById("colorPicker").style.visibility = "hidden";	
				document.getElementById("configurationComplete").innerHTML = LoadDirections();
				break;
			case "finished":
				removeAllInputs();
				hideFinalRow();
				hideFinalColumn();
				changeTopRow(GetHorizontalSolution());
				changeSideColumn(GetVerticalSolution());				
				LoadNono(GetBoardSolution());
				SetNoBorders();
				document.getElementById("clearGrid").style.visibility = "hidden";
				document.getElementById("showMistakes").style.visibility = "hidden";
				document.getElementById("posneg").style.visibility = "hidden";
				document.getElementById("submitHorizontal").style.visibility = "hidden";
				document.getElementById("submitVertical").style.visibility = "hidden";
				document.getElementById("colorPicker").style.visibility = "hidden";	
				document.getElementById("configurationComplete").innerHTML = LoadDirections();
				break;			
		}		
	}
	
	function clearGrid()
	{
//		var boardClone = Object.assign({}, boardEmpty);
		var boardClone = JSON.parse(JSON.stringify(boardEmpty));
		SaveBoardCurrent(boardClone);
		changePhase("changePuzzle");
	}
	
	
	function SetLeftRightBorders()
	{		
		var cells = document.getElementsByClassName("cell");
		for (var i = 0; i < cells.length; i++) {   
			var cell = cells.item(i);
			cell.style.borderColor = "grey";
			cell.style.borderTopWidth = 0;
			cell.style.borderBottomWidth = 0;
			cell.style.borderLeftWidth = 1;
			cell.style.borderRightWidth = 1;
		}
	}
	
	function SetTopBottomBorders()
	{		
		var cells = document.getElementsByClassName("cell");
		for (var i = 0; i < cells.length; i++) {   
			var cell = cells.item(i);
			cell.style.borderColor = "grey";
			cell.style.borderTopWidth = 1;
			cell.style.borderBottomWidth = 1;
			cell.style.borderLeftWidth = 0;
			cell.style.borderRightWidth = 0;
		}
	}
	
	function SetPuzzleBorders()
	{		
		var cells = document.getElementsByClassName("cell");
		for (let i = 0; i < cells.length; i++) {   
			var cell = cells.item(i);
			cell.style.borderColor = "grey";
			cell.style.borderTopWidth = 1;
			cell.style.borderBottomWidth = 1;
			cell.style.borderLeftWidth = 1;
			cell.style.borderRightWidth = 1;
		}
		
		/*
		for(let i = 0; i < 11; i++)
		{
			var topCell = document.getElementById("c" + i + "r0");
			topCell.color = "black";
			topCell.style.backgroundColor = "#e6ed00";
		}
		
		
		for(let i = 0; i < 11; i++)
		{
			var leftCell = document.getElementById("c0r" + i);
			leftCell.color = "black";
			topCell.style.backgroundColor = "#00e4ed";
		}
		*/
		
		//Adds thickness
		for(let i = 1; i < 11; i++)
		{
			document.getElementById("c5r" + i).style.borderRightWidth = 3;
			document.getElementById("c6r" + i).style.borderLeftWidth = 3;
			
			
			document.getElementById("c" + i + "r5").style.borderBottomWidth = 3;
			document.getElementById("c" + i + "r6").style.borderTopWidth = 3;
		}
		
		document.getElementById("mistakesCount").innerHTML = "";
	}
	
	function showColumnError(col)
	{
		for(let i = 1; i < 11; i++)
		{
			var columnId = "c" + col + "r" + i;
			document.getElementById(columnId).style.borderRightWidth = 3;
			document.getElementById(columnId).style.borderLeftWidth = 3;
			
			if(i == 1)
				document.getElementById(columnId).style.borderTopWidth = 3;
			if(i == 10)
				document.getElementById(columnId).style.borderBottomWidth = 3;
				
			
			document.getElementById(columnId).style.borderColor = "red";
		}
		
	//	var colCell = document.getElementById("c" + col + "r0");
	//	colCell.backgroundColor = "red";
	//	colCell.Color = "blue";
	}
	
	
	function showRowError(row)
	{
		for(let i = 1; i < 11; i++)
		{
			var rowId = "c" + i + "r" + row;
			document.getElementById(rowId).style.borderTopWidth = 3;
			document.getElementById(rowId).style.borderBottomWidth = 3;
			
			if(i == 1)
				document.getElementById(rowId).style.borderLeftWidth = 3;
			if(i == 10)
				document.getElementById(rowId).style.borderRightWidth = 3;
				
			
			document.getElementById(rowId).style.borderColor = "salmon";
		}
		
	//	var rowCell = document.getElementById("c0" + "r" + row);
	//	rowCell.backgroundColor = "salmon";
	//	rowCell.Color = "yellow";
	}
	
	function SetNoBorders()
	{		
		var cells = document.getElementsByClassName("cell");
		for (var i = 0; i < cells.length; i++) {   
			var cell = cells.item(i);
			cell.style.borderWidth = 0;
		}
	}
	
	function UpdatePhase(newPhase)
	{
		puzzleCompletion[currentPuzzle] = newPhase;
		changePhase(newPhase);
		UpdateAllPhases(newPhase);
	}
	
	function UpdateAllPhases(newPhase)
	{
		var configId;		
		switch(currentPuzzle)
		{
			case 0:
				configId = "configurationOne";
			break;
			case 1:
				configId = "configurationTwo";
			break;
			case 2:
				configId = "configurationThree";
			break;
			case 3:
				configId = "configurationFour";
			break;
		}		
		var configDiv = document.getElementById(configId);
		
		switch(newPhase)
		{
				case "none":
				default:
				case "changeHorizontal":
					configDiv.style.backgroundImage = "url(images/setRowCell.png)";					
					break;
				case "changeVertical":
					configDiv.style.backgroundImage = "url(images/setColumnCell.png)";
					break;
				case "changeColor":
					configDiv.style.backgroundImage = "url(images/setColorCell.png)";
					break;
				case "changePuzzle":
					var thisColor = GetBlockColor();
					switch(thisColor)
					{
						case "orange":
							configDiv.style.backgroundImage = "url(images/createConfigCellOrange.png)";
							break;
						case "blue":
							configDiv.style.backgroundImage = "url(images/createConfigCellBlue.png)";
							break;
						case "green":
							configDiv.style.backgroundImage = "url(images/createConfigCellGreen.png)";
							break;
						case "purple":
							configDiv.style.backgroundImage = "url(images/createConfigCellPurple.png)";
							break;
					}
					break;
				case "finished":
					var thisColor = GetBlockColor();
					switch(thisColor)
					{
						case "orange":
							configDiv.style.backgroundImage = "url(images/completeCellOrange.png)";
							break;
						case "blue":
							configDiv.style.backgroundImage = "url(images/completeCellBlue.png)";
							break;
						case "green":
							configDiv.style.backgroundImage = "url(images/completeCellGreen.png)";
							break;
						case "purple":
							configDiv.style.backgroundImagee = "url(images/completeCellPurple.png)";
							break;
					}
					break;
		}
	}

	function changeColorCell(cell)
	{	
		
		playAudio("powerup.wav");
		var colorCells = document.getElementsByClassName("colorCell");
		for (var i = 0; i < colorCells.length; i++) {
   
		colorCells.item(i).style.borderColor = "grey";
		}
		
		cell.style.borderColor = "white";
		
	}
	
	function submitColor()
	{	
		var cellId = GetBlockColor();
		if(document.getElementById(cellId).style.borderColor == "white")	
		{
			playAudio('coloraccepted.mp3');
			UpdatePhase("changePuzzle");
		}
		else
		{
			
		playAudio('wrongcolor.mp3');
		}
	}

	function cellClick(vCell)
	{
		
    var cellString = vCell.id;
    var rowArr = cellString.split('r');
    var rowIdx = rowArr[rowArr.length - 1];
    rowArr.pop();
    var colIdx = rowArr.join('').replace('c', '');
		
		switch(puzzleCompletion[currentPuzzle])
		{
			case "changeHorizontal":
				changeHorizontal(vCell, colIdx, rowIdx);
				break;
			case "changeVertical":
				changeVertical(vCell, colIdx, rowIdx);
				break;
			case "changePuzzle":
				puzzleClick(vCell, colIdx, rowIdx);
				break;
		}
	}

	function NoStyling()
	{
					//change everything to no styling
			for(let row = 0; row < 12; row++)
			{
				for(let col = 0; col < 12; col++)
				{					
				changeCell = "c" + col + "r" + row;				
				document.getElementById(changeCell).style.borderColor = "";	
				document.getElementById(changeCell).style.backgroundColor = "";		
				document.getElementById(changeCell).style.color = "";			
				}
			}
	}

	function changeHorizontal(vCell, col, row) {
			var changeCell = "c" + col + "r0";
			var cCell = document.getElementById(changeCell);
			cCell.innerHTML = vCell.innerHTML;
			 
			NoStyling();

			
			//give this column all slightly yellow
			for(let i = 1; i < 12; i++)
			{				
				changeCell = "c" + col + "r" + i;				
				document.getElementById(changeCell).style.backgroundColor = "";		
				document.getElementById(changeCell).style.borderColor = "red";		
				document.getElementById(changeCell).style.borderTopWidth = 0;		
				document.getElementById(changeCell).style.borderBottomWidth = 0;	
				document.getElementById(changeCell).style.color = "#4f4f4f";			
			}
			
			
			cCell.style.borderColor = "red";
			cCell.style.backgroundColor = "red";
			cCell.style.color = "yellow";
			
			vCell.style.backgroundColor = "yellow";
			vCell.style.color = "red";
			
			numberSound(vCell.innerHTML)
		}
		
	function changeVertical(vCell, col, row) {
			var changeCell = "c0r" + row;
			var cCell = document.getElementById(changeCell);
			cCell.innerHTML = vCell.innerHTML;
			
			NoStyling();
			
			//give this row all slightly blue
			for(let i = 1; i < 12; i++)
			{				
				changeCell = "c" + i + "r" + row;				
				document.getElementById(changeCell).style.backgroundColor = "";		
				document.getElementById(changeCell).style.borderColor = "red";		
				document.getElementById(changeCell).style.borderLeftWidth = 0;		
				document.getElementById(changeCell).style.borderRightWidth = 0;	
				document.getElementById(changeCell).style.color = "#4f4f4f";			
			}
			
			
			cCell.style.borderColor = "red";
			cCell.style.backgroundColor = "red";
			cCell.style.color = "blue";
			
			vCell.style.backgroundColor = "blue";
			vCell.style.color = "red";
			
			numberSound(vCell.innerHTML)
			
	}
	
	function numberSound(num)
	{
		switch(num)
		{
		     case "0":
		playAudio('zero.mp3');
			 break;
			case "1":
		playAudio('one.mp3');
			break;
			case "2":
		playAudio('two.mp3');
			break;
			case "3":
		playAudio('three.mp3');
			break;
			case "4":
		playAudio('four.mp3');
			break;
			case "5":
		playAudio('five.mp3');
			break;
			case "6":
		playAudio('six.mp3');
			break;
			case "7":
		playAudio('seven.mp3');
			break;
			case "8":
		playAudio('eight.mp3');
			break;
			case "9":
		playAudio('nine.mp3');
			break;
			case "10":
		playAudio('ten.mp3');
			break;
		}				
	}

	

	
	function changeTopRow(horString)
	{
		var horInputs = horString.split('.');
		for(let col = 0; col < horInputs.length-1; col++)
		{			
				var changeCell = "c" + (col+1) + "r0";	
				var cCell = document.getElementById(changeCell);
				cCell.innerHTML = horInputs[col];	
		}
	}
	function changeSideColumn(verString)
	{
		var verInputs = verString.split('.');
		for(let row = 0; row < verInputs.length; row++)
		{			
				var changeCell = "c0r" + (row+1);	
				var cCell = document.getElementById(changeCell);
				cCell.innerHTML = verInputs[row];	
		}
	}
	
	function setHorizontalInputs() {
		
		for(let col = 1; col < 12; col++)
			{				
				for(let row = 1; row < 12; row++)
				{
					var changeCell = "c" + col + "r" + row;				
					document.getElementById(changeCell).innerHTML = row-1;			
				}
			}
	}
	
	function setVerticalInputs() {
		
		for(let row = 1; row < 11; row++)
			{				
				for(let col = 1; col < 12; col++)
				{
					var changeCell = "c" + col + "r" + row;				
					document.getElementById(changeCell).innerHTML = col-1;			
				}
			}
	}
	
	function removeAllInputs()
	{
		
		for(let row = 1; row < 12; row++)
		{				
			for(let col = 1; col < 12; col++)
			{
				
					var changeCell = "c" + col + "r" + row;				
					document.getElementById(changeCell).innerHTML = "";	
					document.getElementById(changeCell).style.backgroundImage = "";	
			}
		}		
	}
	
	
	function hideFinalRow() {
						
		for(let col = 0; col < 12; col++)
		{
			var changeCell = "c" + col + "r11";				
			document.getElementById(changeCell).style.visibility = "hidden";			
		}			
	}
	
	function revealFinalRow() {
						
		for(let col = 0; col < 12; col++)
		{
			var changeCell = "c" + col + "r11";				
			document.getElementById(changeCell).style.visibility = "visible";			
		}			
		
		changeCell = "c0r11";
		
			document.getElementById(changeCell).style.visibility = "hidden";
	}
	
	function revealFinalColumn() {
						
		for(let row = 1; row < 12; row++)
		{
			var changeCell = "c11r" + row;				
			document.getElementById(changeCell).style.visibility = "visible";			
		}			
	}
	
	function hideFinalColumn() {
						
		for(let row = 1; row < 12; row++)
		{
			var changeCell = "c11r" + row;				
			document.getElementById(changeCell).style.visibility = "hidden";			
		}			
	}
	
	function submitHorizontalRow()
	{
		
		var horInput = "";
		
		for(let col = 1; col < 11; col++)
			{				
				var changeCell = "c" + col + "r0";				
				horInput += document.getElementById(changeCell).innerHTML + ".";			
			}
		

		//FOR TESTING 
		//horInput = orangeHorizontal;

		if(
		(horInput == orangeHorizontal) ||
		horInput == blueHorizontal ||
		horInput == greenHorizontal ||
		horInput == purpleHorizontal 
		) //CORRECT!
		{		
				if(HorizonalAlreadyUsed(horInput))
				{
		playAudio('rowinputalreadyused.mp3');
				}
				else
				{
		playAudio('rowinputaccepted.mp3');
				SetColorFromHorizontal(horInput);
				UpdatePhase("changeVertical");
				}
		}
		else //INCORRECT!
		{			
		playAudio('rowinputinvalid.mp3');
		}					
	}
	

	
	function submitVerticalColumn()
	{
		var verSolution = GetVerticalSolution();
		var verInput = "";
		
		for(let row = 1; row < 11; row++)
			{				
				var changeCell = "c0r" + row;				
				verInput += document.getElementById(changeCell).innerHTML + ".";			
			}
		
		//testing take outerHTML
		//verInput = GetVerticalSolution();
		if(verInput == verSolution) //CORRECT!
		{			
		playAudio('columninputaccepted.mp3');
				UpdatePhase("changeColor");
		}
		else //INCORRECT!
		{			
		
		playAudio('columninputwrong.mp3');
		}					
	}

	function changePos()
	{
		PositiveTap = true;
		
			var img = document.getElementById("pos");			
					img.src = GetPosImage();
			var img = document.getElementById("neg");			
					img.src = "images/negUnselected.png";
		
	}
	
	function changeNeg()
	{
		PositiveTap = false;
		
			var img = document.getElementById("pos");			
					img.src = GetPosUnselected(); //"images/posUnselected.png";
			var img = document.getElementById("neg");			
					img.src = "images/negSelected.png";
		
	}


/*----- constants -----*/
const solution = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 0
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0], // column 1
    [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0], // column 2
    [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0], // column 3
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0], // column 4
    [0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0], // column 5
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // column 6
    [0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1], // column 7
    [0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1], // column 8
    [0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], // column 9
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0] // column 10
  ];



/*----- app's state variables -----*/
var board;

/*----- cached element references -----*/

//var cells = document.querySelectorAll('div');
//var headline = document.getElementById('headline');
//var puzzleBoard = document.getElementById('puzzleboard');
//var restartButton = document.getElementById('restart');
//var fullPuzzle = document.getElementById('puzzle-full');
//var fullInstructions = document.getElementById('instructions');


var PositiveTap = true;
var currentBackgroundColor = 'orange';
var negImage = "url('images/NegativeWhite.png')";


/*----- event listeners -----*/

//puzzleBoard.addEventListener('click', handleClick);
//restartButton.addEventListener('click', cleanBoard);


/*----- functions -----*/
initialize();

// Swap gameboard for instructions on click
function toggleInstructions() {
var fullPuzzle = document.getElementById('puzzle-full');
var fullInstructions = document.getElementById('instructions');
    if (!fullPuzzle.style.display) {
        fullPuzzle.style.display = 'none';
        fullInstructions.style.display = 'block'
    } else if (fullPuzzle.style.display == 'none') {
        fullPuzzle.style.display = 'block';
        fullInstructions.style.display = 'none'
    } else if (fullPuzzle.style.display == 'block') {
        fullPuzzle.style.display = 'none';
        fullInstructions.style.display = 'block'
    }
}

// Make all cells white on restart
function cleanBoard() {
	
var headline = document.getElementById('headline');
var cells = document.querySelectorAll('div');
    initialize()
    cells.forEach(function (el) {
		el.style.backgroundColor = ''
		el.style.backgroundImage = ''
		})
    headline.innerHTML = 'nonogram puzzle';
}

// Make tiles toggle white/black AND toggle cell value 0/1
function puzzleClick(marker, colIdx, rowIdx) {
	SetPuzzleBorders();
	var currentBlockColor = GetBlockColor();
	board = GetBoardCurrent();
    if (colIdx != 0) {
        if (PositiveTap == true) {
				marker.style.backgroundImage = '' //turn off any background image
				if (!marker.style.backgroundColor) {
					marker.style.backgroundColor = currentBlockColor
					board[rowIdx][colIdx] = 1;
					
					playAudio('keyok1.mp3');
				} else if (marker.style.backgroundColor = currentBlockColor) {
					marker.style.backgroundColor = '';
					board[rowIdx][colIdx] = 0;
					playAudio('keyok2.mp3');
				}
			
        } else {
				board[rowIdx][colIdx] = 2; //turn off any selection
				marker.style.backgroundColor = ''; //turn off any color
				
				if (!marker.style.backgroundImage) {
				marker.style.backgroundImage = negImage;				
					playAudio('keyok3.mp3');
				} else if (marker.style.backgroundImage = negImage) {
					marker.style.backgroundImage = ''					
					playAudio('keyok5.mp3');
				} 
        }
    }
    checkWin()
}

function LoadNono(board)
{
	var backgroundColor = GetBlockColor();
	for(let row = 1; row < 11; row++)
	{
		for(let col = 1; col < 11; col++)
		{
				var box = board[row][col];
				
				var cellId = "c" + col + "r" + row;
				var marker = document.getElementById(cellId);
				
				switch(box)
				{
					case 0:
						marker.style.backgroundColor = '';
						marker.style.backgroundImage = '';
						break;
					case 1:
						marker.style.backgroundImage = '';
						marker.style.backgroundColor = backgroundColor;
						break;
					case 2:
						marker.style.backgroundImage = negImage;
						marker.style.backgroundColor = '';
						break;
				}																
		}		
	}
	
}



// Check if current board array matches solution array
function checkWin() {
	var boardString = GetBoardCurrent().toString();
	var board = boardString.replace(/2/g,'0');
	
	if(board == GetBoardSolution().toString() || board == boardCheat.toString())
	{
		playAudio('configurationcomplete.wav');
		UpdatePhase("finished");
	}
}

function showMistakes()
{
	var boardString = GetBoardCurrent().toString();
	var board = boardString.replace(/2/g,'0');
	
	var boardSolution = GetBoardSolution().toString();
	
	var errorCount = 0;
	for (var i = 0; i < board.length; i++) {		
		if(board.charAt(i) != boardSolution.charAt(i))
		{
			errorCount++;
		}
	}
	document.getElementById("mistakesCount").innerHTML = errorCount;
	
	/*
	currentBoard = GetBoardCurrent();
	solutionBoard = GetBoardSolution();
	
	//compare columns
	for(let i = 1; i < 11; i++)
	{
		var currentColumn = getCol(currentBoard, i);		
		var currentFillCount = countInArray(currentColumn, 1)
		
		var solutionColumn = getCol(solutionBoard, i);
		var solutionFillCount = countInArray(solutionColumn, 1);
		
		if(currentFillCount != solutionFillCount)
		{
			showColumnError(i);
		}
	}
	
	
	//compare rows
	for(let i = 1; i < 11; i++)
	{
		var currentRow = currentBoard[i];	
		var currentFillCount = countInArray(currentRow, 1)
		
		var solutionRow = solutionBoard[i];
		var solutionFillCount = countInArray(solutionRow, 1);
		
		if(currentFillCount != solutionFillCount)
		{
			showRowError(i);
		}
	}	
	*/
}

function countInArray(array, value) {
  return array.reduce((n, x) => n + (x === value), 0);
}

function getCol(matrix, col){
       var column = [];
       for(var i=0; i<matrix.length; i++){
          column.push(matrix[i][col]);
       }
       return column;
    }

// Initialize board
function initialize() {
	/*
    board = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 1
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 2
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 3
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 4
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 5
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 6
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 7
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 8
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // column 9
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // column 10
    ];
	*/
}


	var xenospacedrive3 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenospace <br />Drive</div>\
		<div class="dataimage"><img class="dataimg" src="images/xenospacedrive.png"></div>\
		<div class="datacontent">\
		ThE Xenospace Drive allows starships to open a wormhole to travel through Xenospace and exit at another point in the galaxy in mere moments.\
		<br /><br />To configure a jump, four Lucidite Crystals are placed in a specific way and their colors are set using the Chroma Calibrators.\
		<br /><br />Then, press the green button and the ship\'s computer to process the jump. \
		</div>\
		<button class="greenbutton databutton" style="top: 550" onmousedown="playRandomSound()" style="top: 500px" onclick="StartContent(\'xenospacedrive4\');">More</button>';
		
				var xenospacedrive4 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenospace <br />Drive</div>\
		<div class="dataimage"><img class="dataimg" src="images/xenospacedrive.png"></div>\
		<div class="datacontent">\
		The position and color of the four crystals complete a higher dimensional algorithm that safely navigates the ship through Xenospace called a ‘Xenospace Configuration’. \
		<br /><br />Currently, the Galactic Concordant has cleared and released 22 Xenospace Configurations that will navigate starships to 22 corresponding locations throughout the galaxy.\
		<br /><br />Only configuraitons deemed to be valid by the ship\'s computer can be activated.\
		</div>\
		<button class="greenbutton databutton" style="height: 100px; width: 250px; left: 220px; top: 480px;" onmousedown="playAudio(\'configurationloss.mp3\')" style="top: 500px" onclick="StartContent(\'dataloss\');">View Xenospace Configurations</button>';
		
			var dataloss = '\
	<a class="warningButton errorPosition" href="#" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\')">ERROR <br />Xenospace <br />Configuration<br />Data Loss</a>';

///////////////////////////////////////////////////////////////////////////////
