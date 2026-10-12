/////////////////////////////////// BIOGENETIC RESEARCH /////////////////////////////////////
var biogeneticFunction1 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 40px">Biogenetic Lab</div>\
		<div class="dataimage"><img class="dataimg" src="images/biogeneticlab.png"></div>\
		<div class="datacontent">\
<font color=#f78420><b>Contents:</b></font> Zoological specimens collected from Impon 7.\
<br \><font color=#4ef421><b>Status:</b>  </font>All specimens deceased due to power loss.\
<br><br>The buttons stimulate the nervous systems of a specimen, forcing them to emit their natural vocalization (even if the specimen is deceased).\
<br /><br />Follow steps for accelerated embryonic growth.\
		</div>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'biogeneticFunction2\');">Step 1</button>';
	var biogeneticFunction2 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 40px">Biogenetic Lab</div>\
		<div class="dataimage"><img class="dataimg" src="images/embryo.png"></div>\
		<div class="datacontent">\
		REMOVE THE ORGANISM FROM THE STASIS CONTAINER. USE THE WASTE DISPOSAL UNIT TO DISPOSE OF EXCESS FLUID. BE CAREFUL NOT TO SPILL STASIS FLUID ON ELECTRONICS.\
		<br /><br />FIND THE EMBRYONIC SAC INSIDE THE ORGANISM AND REMOVE IT.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'biogeneticFunction1\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'biogeneticFunction3\');">Step 2</button>';

	var biogeneticFunction3 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 40px">Biogenetic Lab</div>\
		<div class="dataimage"><img class="dataimg" src="images/embryo2.png"></div>\
		<div class="datacontent">\
		Use the embryonic extraction tools to gently remove the embryo from the embryonic sac.\
		<br /><br />Set the embryo in the sample tray and add fluid to accelerate its growth through ontogenesis. \
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'biogeneticFunction2\');">Back</button>\
		<button class="nextbutton" onmousedown="playRandomSound()" onclick="StartContent(\'biogeneticFunction4\');">Step 3</button>';

	var biogeneticFunction4 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 40px">Biogenetic Lab</div>\
		<div class="dataimage"><img class="dataimg" src="images/embryo3.png"></div>\
		<div class="datacontent">\
		After a few minutes, the embryo will spawn into a newborn organism.\
		</div>\
		<button class="prevbutton" onmousedown="playRandomSound()" onclick="StartContent(\'biogeneticFunction3\');">Back</button>';
	
	///////////////////////////////////////////////////////////////////////