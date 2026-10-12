//////////////////////////////////////////////XENOPHOTON EXPOSER ///////////////////////////////////	
	

var xenophotons1 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
	<div class="datatitle" style="font-size: 35px; top: 25px">Shimaki <br />Data Log</div>\
		<div class="dataimage"><img class="dataimg" src="images/stars.gif"></div>\
		<div class="datacontent">\
		Urbraxians use a novel method to send communications across the galaxy instantly.  By accessing the Xenospace network, they can bombard celestial bodies with Xenophotons, thus turning the stars themselves into a system of data storage that can be encoded with audio-visual signals.\
		<br /><br />However, I have discovered a way to intercept these secret Urbraxian communications by using a Xenophoton Exposer.\
	</div>\
		<button class="greenbutton databutton" onmousedown="playRandomSound()"  style="top: 550; font-size: 14; height: 50;" onclick="StartContent(\'xenophotons2\');">How to use Xenophoton Exposer</button>';

var xenophotons2 = '\
		<button class="backbutton" onmousedown="playRandomSound()" onclick="StartContent(\'mainMenu\');">BACK</button>\
		<div class="datatitle" style="font-size: 35px; top: 25px">Xenophoton <br />Network</div>\
		<div class="dataimage"><img class="dataimg" src="images/xenophotonexposer.png"></div>\
		<div class="datacontent">\
			1. Find the Xenophoton Exposer - It is pictured to the right.\
<br /><br />2. Find a cluster of stars - Celestial bodies act as a data storage system for audio-visual messages.\
<br /><br />3. Point the Xenophoton Exposer at the stars and press the “On” button - If there is a hidden code, the stars will change colors.  (Warning: You may need to press the button several times)\
	</div>\
		<button class="greenbutton databutton" onmousedown="playRandomSound()" style="top: 500px" onclick="StartContent(\'xenophotons3\');">Next Steps</button>';
	

			var xenophotons3 = '\
				<button class="backbutton" onmousedown="playRandomSound()" style="left: 27px; width: 59px; height: 41px; top: 86px" onclick="StartContent(\'xenophotons2\');">Back</button>\
		<button class="backbutton" onmousedown="playRandomSound()" style="left: 372px; width: 154px; height: 20px; top: 556px" onclick="StartContent(\'mainMenu\');">Main Menu</button>\
				<div class="datacontent" style="top: 10; width: 800">\
		4. Touch the stars below to change their colors to recreate the colored pattern you have exposed.\
		</div>\
				<div class="starchartparent">\
		<img src="images/starchartblack.png">\
		<img style="position: absolute; top: 201; left: 110;" onclick="changeStar(0)"; id="star0" src="images/starwhite.png">\
		<img style="position: absolute; top: 194; left: 200;" onclick="changeStar(1)" id="star1" src="images/starwhite.png">\
		<img style="position: absolute; top: 68; left: 300;" onclick="changeStar(2)" id="star2" src="images/starwhite.png">\
		<img style="position: absolute; top: 120; left: 430;" onclick="changeStar(3)" id="star3" src="images/starwhite.png">\
		<img style="position: absolute; top: 280; left: 510;" onclick="changeStar(4)" id="star4" src="images/starwhite.png">\
		<img style="position: absolute; top: 150; left: 560;" onclick="changeStar(5)" id="star5" src="images/starwhite.png">\
		</div>\
			<div class="datacontent" style="top: 475; width: 800">\
		5. Apply the decompression algorithm - If successful, you will see the audio-visual communication.\
		</div>\
		<button class="greenbutton databutton" style="top: 200; left: 730; font-size: 18;height: 100; width: 175" onclick="XenophotonDecompress()";">Apply Decompression Algorithm</button>';
	

		var secrettransmission = '\
		<button class="backbutton" onmousedown="playRandomSound()" style="left: 27px; width: 59px; height: 41px; top: 86px" onclick="StartContent(\'mainMenu\');">Main Menu</button>\
		<button class="backbutton" onmousedown="playRandomSound()" style="left: 372px; width: 154px; height: 20px; top: 556px" onclick="StartContent(\'mainMenu\');">Main Menu</button>\
		<div class="videoposition"><video width="824" height="439" controls>\
			<source src="../videos/KreegSecretTransmission.mp4" type="video/mp4">\
			Your browser does not support the video tag.\
		</video></div>\
		';

/////////////////////////////////////////////////////////////